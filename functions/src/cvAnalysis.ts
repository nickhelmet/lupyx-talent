import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";

const SYSTEM_INSTRUCTION = `Sos un asistente experto en análisis de CVs/resumes para reclutamiento.

Tu tarea es analizar un PDF de CV y extraer información estructurada.

Si el documento NO es un CV/resume (ej: factura, contrato, documento legal), responde:
{ "is_cv": false, "rejection_reason": "Descripción del tipo de documento" }

Si ES un CV, extraé:

{
  "is_cv": true,
  "summary": "Resumen ejecutivo de 3-5 líneas para el reclutador",
  "personal": {
    "full_name": "Nombre completo",
    "email": "Email si aparece",
    "phone": "Teléfono si aparece",
    "location": "Ciudad/País si aparece",
    "linkedin": "URL de LinkedIn si aparece"
  },
  "experience": [
    {
      "company": "Empresa",
      "position": "Cargo",
      "period": "Período (ej: 2020-2023)",
      "description": "Breve descripción del rol"
    }
  ],
  "education": [
    {
      "institution": "Institución",
      "degree": "Título/Carrera",
      "year": "Año de graduación o período"
    }
  ],
  "skills": ["skill1", "skill2"],
  "languages": ["Español (nativo)", "Inglés (avanzado)"],
  "certifications": ["Certificación 1"],
  "total_years_experience": 5,
  "seniority_level": "Senior/Semi-Senior/Junior"
}

Responde SOLO con JSON válido, sin texto adicional.`;

export const analyzeCv = onRequest({ maxInstances: 1, secrets: ["GEMINI_API_KEY"] }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "fraudAnalysis", user.uid))) return;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) { res.status(500).json({ error: "Gemini API key not configured" }); return; }

  const applicationId = typeof req.body.applicationId === "string"
    ? req.body.applicationId.replace(/[^a-zA-Z0-9_-]/g, "") : "";
  if (!applicationId) { res.status(400).json({ error: "Missing applicationId" }); return; }

  const db = getFirestore();
  const appDoc = await db.doc(`applications/${applicationId}`).get();
  if (!appDoc.exists) { res.status(404).json({ error: "Application not found" }); return; }

  const cvPath = appDoc.data()?.cvPath;
  if (!cvPath) { res.status(400).json({ error: "No CV uploaded for this application" }); return; }

  try {
    // Download CV from Storage
    const bucket = getStorage().bucket();
    const [buffer] = await bucket.file(cvPath).download();
    const cvBase64 = buffer.toString("base64");

    // Call Gemini
    const genai = new GoogleGenAI({ apiKey });
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Analizá este CV y extraé la información estructurada." },
            { inlineData: { mimeType: "application/pdf", data: cvBase64 } },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.1,
      },
    });

    const text = response.text || "";
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      res.status(500).json({ error: "Failed to parse Gemini response" }); return;
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Save to Firestore
    await db.doc(`applications/${applicationId}`).update({
      cvAnalysis: analysis,
      cvAnalyzedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    res.status(200).json(analysis);
  } catch (error) {
    console.error("CV analysis error:", error);
    res.status(500).json({ error: "Failed to analyze CV" });
  }
});

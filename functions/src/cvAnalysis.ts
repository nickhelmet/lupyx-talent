import { onRequest } from "firebase-functions/v2/https";
import { GoogleGenAI } from "@google/genai";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";

const SYSTEM_INSTRUCTION = `Sos un asistente experto en análisis de CVs/resumes para reclutamiento en LATAM.

Tu tarea es analizar un PDF de CV, extraer información estructurada, y evaluar el match con una búsqueda laboral.

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
  "languages": [
    {
      "language": "Español",
      "level": "Nativo/Avanzado/Intermedio/Básico",
      "certifications": "TOEFL 100, Cambridge C1, etc. (si aplica)"
    }
  ],
  "certifications": ["Certificación 1"],
  "total_years_experience": 5,
  "seniority_level": "Senior/Semi-Senior/Junior",
  "job_match": {
    "score": 75,
    "meets": ["Requisito que cumple 1", "Requisito que cumple 2"],
    "missing": ["Requisito que NO cumple 1"],
    "notes": "Observación breve sobre el match"
  },
  "better_fit_jobs": [
    {
      "job_title": "Título de otra búsqueda que encaja mejor",
      "reason": "Por qué encajaría mejor"
    }
  ]
}

Para determinar el nivel de idioma:
- Si tiene certificación (TOEFL, IELTS, Cambridge, DELE): usar el nivel del certificado
- Si trabajó en empresas internacionales o tiene experiencia en el idioma: inferir Avanzado
- Si solo menciona el idioma sin contexto: inferir Intermedio
- Si cursó el idioma en la universidad: inferir Intermedio-Avanzado

Para el job_match:
- Comparar skills y experiencia del CV contra los requisitos de la búsqueda
- score 0-100: 0=no encaja, 50=parcial, 75=buen match, 90+=excelente
- Listar qué requisitos cumple y cuáles no

Para better_fit_jobs:
- Si el candidato encajaría mejor en otra búsqueda activa, sugerirla
- Solo sugerir si hay búsquedas disponibles que se proporcionan

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

    // Get the job this application is for
    const jobId = appDoc.data()?.jobId;
    let jobContext = "";
    if (jobId) {
      const jobDoc = await db.doc(`jobs/${jobId}`).get();
      if (jobDoc.exists) {
        const j = jobDoc.data()!;
        jobContext = `\n\nBÚSQUEDA A LA QUE SE POSTULÓ:\nTítulo: ${j.title}\nEmpresa: ${j.company}\nDescripción: ${j.description}\nRequisitos: ${j.requirements || "No especificados"}\nUbicación: ${j.location}\nTags: ${(j.tags || []).join(", ")}`;
      }
    }

    // Get other active jobs for better_fit suggestion
    const otherJobs = await db.collection("jobs").where("status", "==", "ACTIVE").get();
    const otherJobsList = otherJobs.docs
      .filter((d) => d.id !== jobId)
      .map((d) => `- ${d.data().title} (${d.data().company}): ${d.data().requirements || d.data().description}`)
      .join("\n");
    const otherJobsContext = otherJobsList ? `\n\nOTRAS BÚSQUEDAS ACTIVAS:\n${otherJobsList}` : "";

    // Call Gemini
    const genai = new GoogleGenAI({ apiKey });
    const response = await genai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: `Analizá este CV y extraé la información estructurada. Evaluá el match con la búsqueda.${jobContext}${otherJobsContext}` },
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

import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";
import { sanitizeString, validateEmail, validatePhone } from "./validation";

export const listCandidates = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const db = getFirestore();
  const snapshot = await db.collection("candidates").orderBy("createdAt", "desc").limit(200).get();
  const candidates = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.status(200).json(candidates);
});

export const addCandidate = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "createJob", user.uid))) return;

  const raw = req.body;
  const firstName = sanitizeString(raw.firstName).slice(0, 100);
  const lastName = sanitizeString(raw.lastName).slice(0, 100);
  const email = validateEmail(raw.email);
  const phone = validatePhone(raw.phone);

  if (!firstName || !lastName) {
    res.status(400).json({ error: "Nombre y apellido requeridos" }); return;
  }

  const db = getFirestore();
  const candidate = {
    firstName,
    lastName,
    email: email || null,
    phone: phone || null,
    city: sanitizeString(raw.city).slice(0, 100) || null,
    skills: Array.isArray(raw.skills) ? raw.skills.map((s: string) => sanitizeString(s).slice(0, 50)).slice(0, 30) : [],
    notes: sanitizeString(raw.notes).slice(0, 5000) || null,
    tags: Array.isArray(raw.tags) ? raw.tags.map((t: string) => sanitizeString(t).slice(0, 30)).slice(0, 10) : [],
    source: sanitizeString(raw.source).slice(0, 50) || "manual",
    cvPath: null,
    cvAnalysis: null,
    matchHistory: [],
    createdBy: user.email,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  const ref = await db.collection("candidates").add(candidate);
  res.status(201).json({ id: ref.id, message: "Candidate added" });
});

export const deleteCandidate = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const candidateId = typeof req.body.candidateId === "string"
    ? req.body.candidateId.replace(/[^a-zA-Z0-9_-]/g, "") : "";
  if (!candidateId) { res.status(400).json({ error: "Missing candidateId" }); return; }

  const db = getFirestore();
  await db.doc(`candidates/${candidateId}`).delete();
  res.status(200).json({ message: "Candidate deleted" });
});

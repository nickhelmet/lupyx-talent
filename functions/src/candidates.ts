import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";
import { sanitizeString, validateEmail, validatePhone } from "./validation";

// In-memory cache for enriched candidates (avoids N+1 queries on every request)
let candidatesCache: { data: unknown[]; ts: number } | null = null;
const CANDIDATES_CACHE_TTL = 30_000; // 30 seconds

export const listCandidates = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  // Return cached if fresh
  if (candidatesCache && Date.now() - candidatesCache.ts < CANDIDATES_CACHE_TTL) {
    res.status(200).json(candidatesCache.data);
    return;
  }

  const db = getFirestore();
  const snapshot = await db.collection("candidates").orderBy("createdAt", "desc").limit(200).get();

  // Batch-fetch all applications and users to avoid N+1
  const emails = snapshot.docs
    .map((doc) => doc.data().email as string | null)
    .filter((e): e is string => !!e);
  const uniqueEmails = [...new Set(emails)];

  // Fetch all applications for all candidate emails in one batch (max 30 per "in" query)
  const appsByEmail = new Map<string, FirebaseFirestore.QueryDocumentSnapshot[]>();
  for (let i = 0; i < uniqueEmails.length; i += 30) {
    const batch = uniqueEmails.slice(i, i + 30);
    const appsSnap = await db.collection("applications")
      .where("email", "in", batch)
      .orderBy("appliedAt", "desc")
      .get();
    appsSnap.docs.forEach((doc) => {
      const email = doc.data().email as string;
      if (!appsByEmail.has(email)) appsByEmail.set(email, []);
      appsByEmail.get(email)!.push(doc);
    });
  }

  // Fetch all user profiles in one batch
  const profilesByEmail = new Map<string, FirebaseFirestore.DocumentData>();
  for (let i = 0; i < uniqueEmails.length; i += 30) {
    const batch = uniqueEmails.slice(i, i + 30);
    const usersSnap = await db.collection("users")
      .where("email", "in", batch)
      .get();
    usersSnap.docs.forEach((doc) => {
      profilesByEmail.set(doc.data().email as string, doc.data());
    });
  }

  // Enrich candidates
  const candidates = snapshot.docs.map((doc) => {
    const data = { id: doc.id, ...doc.data() } as Record<string, unknown>;
    const email = data.email as string | null;

    if (email) {
      const appDocs = appsByEmail.get(email) || [];
      data.applications = appDocs.slice(0, 10).map((appDoc) => {
        const app = appDoc.data();
        return {
          id: appDoc.id, jobTitle: app.jobTitle, jobCompany: app.jobCompany,
          status: app.status, appliedAt: app.appliedAt, educationLevel: app.educationLevel,
          dni: app.dni, birthDate: app.birthDate, address: app.address,
          coverLetter: app.coverLetter, cvPath: app.cvPath, cvAnalysis: app.cvAnalysis, scores: app.scores,
        };
      });

      const profile = profilesByEmail.get(email);
      if (profile) {
        data.userProfile = {
          summary: profile.profile?.summary || null,
          skills: profile.profile?.skills || [],
          languages: profile.profile?.languages || [],
          educationLevel: profile.educationLevel || null,
          image: profile.image || null,
        };
      }
    }

    return data;
  });

  candidatesCache = { data: candidates, ts: Date.now() };
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

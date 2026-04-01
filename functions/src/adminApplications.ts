import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";
import { validateApplicationStatus, sanitizeString } from "./validation";

export const adminListApplications = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "adminListApplications", user.uid))) return;

  const db = getFirestore();
  const snapshot = await db.collection("applications").orderBy("appliedAt", "desc").limit(100).get();
  const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.status(200).json(apps);
});

export const updateApplicationStatus = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "updateApplicationStatus", user.uid))) return;

  const applicationId = typeof req.body.applicationId === "string" ? req.body.applicationId.replace(/[^a-zA-Z0-9_-]/g, "") : "";
  const status = validateApplicationStatus(req.body.status);
  if (!applicationId || !status) {
    res.status(400).json({ error: "Invalid applicationId or status" }); return;
  }

  const db = getFirestore();
  await db.doc(`applications/${applicationId}`).update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  });
  res.status(200).json({ message: `Status updated to ${status}` });
});

export const addInterviewNotes = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "addInterviewNotes", user.uid))) return;

  const applicationId = typeof req.body.applicationId === "string" ? req.body.applicationId.replace(/[^a-zA-Z0-9_-]/g, "") : "";
  if (!applicationId) { res.status(400).json({ error: "Missing applicationId" }); return; }

  const db = getFirestore();
  const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  // Sanitize scores (0-10 range)
  if (req.body.scores && typeof req.body.scores === "object") {
    const s = req.body.scores;
    const clamp = (v: unknown) => typeof v === "number" ? Math.max(0, Math.min(10, v)) : null;
    updates.scores = {
      technical: clamp(s.technical),
      communication: clamp(s.communication),
      experience: clamp(s.experience),
      motivation: clamp(s.motivation),
      overall: clamp(s.overall),
    };
  }

  // Sanitize interview meta
  if (req.body.interviewMeta && typeof req.body.interviewMeta === "object") {
    const m = req.body.interviewMeta;
    updates.interviewMeta = {
      date: typeof m.date === "string" ? m.date.slice(0, 30) : null,
      interviewer: sanitizeString(m.interviewer).slice(0, 100),
      notes: sanitizeString(m.notes).slice(0, 5000),
    };
  }

  await db.doc(`applications/${applicationId}`).update(updates);
  res.status(200).json({ message: "Notes updated" });
});

export const manageInterviewRounds = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "manageInterviewRounds", user.uid))) return;

  const db = getFirestore();
  const { applicationId, roundId, ...data } = req.body;
  if (!applicationId) { res.status(400).json({ error: "Missing applicationId" }); return; }

  const roundsRef = db.collection(`applications/${applicationId}/interviewRounds`);

  if (req.method === "POST") {
    const round = {
      ...data,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const ref = await roundsRef.add(round);
    res.status(201).json({ id: ref.id }); return;
  }

  if (req.method === "PATCH" && roundId) {
    await roundsRef.doc(roundId).update({ ...data, updatedAt: FieldValue.serverTimestamp() });
    res.status(200).json({ message: "Round updated" }); return;
  }

  if (req.method === "GET") {
    const snapshot = await roundsRef.orderBy("roundNumber").get();
    const rounds = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    res.status(200).json(rounds); return;
  }

  res.status(405).json({ error: "Method not allowed" });
});

import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";

export const adminListApplications = onRequest({ maxInstances: 5 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const db = getFirestore();
  const snapshot = await db.collection("applications").orderBy("appliedAt", "desc").limit(100).get();
  const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.status(200).json(apps);
});

export const updateApplicationStatus = onRequest({ maxInstances: 3 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const { applicationId, status } = req.body;
  const validStatuses = ["PENDING", "REVIEWING", "INTERVIEW", "REJECTED", "ACCEPTED", "HIRED"];
  if (!applicationId || !validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid applicationId or status" }); return;
  }

  const db = getFirestore();
  await db.doc(`applications/${applicationId}`).update({
    status,
    updatedAt: FieldValue.serverTimestamp(),
  });
  res.status(200).json({ message: `Status updated to ${status}` });
});

export const addInterviewNotes = onRequest({ maxInstances: 3 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const { applicationId, scores, interviewMeta } = req.body;
  if (!applicationId) { res.status(400).json({ error: "Missing applicationId" }); return; }

  const db = getFirestore();
  const updates: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (scores) updates.scores = scores;
  if (interviewMeta) updates.interviewMeta = interviewMeta;

  await db.doc(`applications/${applicationId}`).update(updates);
  res.status(200).json({ message: "Notes updated" });
});

export const manageInterviewRounds = onRequest({ maxInstances: 3 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

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

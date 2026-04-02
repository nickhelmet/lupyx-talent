import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";
import { sanitizeString } from "./validation";

export const addComment = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "addInterviewNotes", user.uid))) return;

  const applicationId = typeof req.body.applicationId === "string" ? req.body.applicationId.replace(/[^a-zA-Z0-9_-]/g, "") : "";
  const text = sanitizeString(req.body.text).slice(0, 2000);
  const isInternal = req.body.isInternal === true;

  if (!applicationId || !text) {
    res.status(400).json({ error: "Missing applicationId or text" }); return;
  }

  const db = getFirestore();
  const comment = {
    text,
    isInternal,
    author: user.email,
    createdAt: new Date().toISOString(),
  };

  await db.doc(`applications/${applicationId}`).update({
    comments: FieldValue.arrayUnion(comment),
    updatedAt: FieldValue.serverTimestamp(),
  });

  res.status(200).json({ message: "Comment added" });
});

export const getApplicationDetail = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const applicationId = typeof req.query.id === "string" ? req.query.id.replace(/[^a-zA-Z0-9_-]/g, "") : "";
  if (!applicationId) { res.status(400).json({ error: "Missing id" }); return; }

  const db = getFirestore();
  const doc = await db.doc(`applications/${applicationId}`).get();
  if (!doc.exists) { res.status(404).json({ error: "Not found" }); return; }

  res.status(200).json({ id: doc.id, ...doc.data() });
});

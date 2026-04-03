import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";

export const withdrawApplication = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (!(await rateLimit(req, res, "submitApplication", user.uid))) return;

  const applicationId = typeof req.body.applicationId === "string"
    ? req.body.applicationId.replace(/[^a-zA-Z0-9_-]/g, "") : "";
  if (!applicationId) { res.status(400).json({ error: "Missing applicationId" }); return; }

  const db = getFirestore();
  const appDoc = await db.doc(`applications/${applicationId}`).get();

  if (!appDoc.exists || appDoc.data()?.userId !== user.uid) {
    res.status(403).json({ error: "Not your application" }); return;
  }

  // Only allow withdrawal if still PENDING
  if (appDoc.data()?.status !== "PENDING") {
    res.status(400).json({ error: "Solo se pueden retirar postulaciones pendientes" }); return;
  }

  await db.doc(`applications/${applicationId}`).delete();
  res.status(200).json({ message: "Postulación retirada" });
});

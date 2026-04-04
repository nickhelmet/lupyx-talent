import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";

export const deleteApplication = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "updateApplicationStatus", user.uid))) return;

  const applicationId = typeof req.body.applicationId === "string"
    ? req.body.applicationId.replace(/[^a-zA-Z0-9_-]/g, "") : "";
  if (!applicationId) { res.status(400).json({ error: "Missing applicationId" }); return; }

  const db = getFirestore();
  const appDoc = await db.doc(`applications/${applicationId}`).get();
  if (!appDoc.exists) { res.status(404).json({ error: "Application not found" }); return; }

  // Delete CV from Storage if exists
  const cvPath = appDoc.data()?.cvPath;
  if (cvPath) {
    try {
      await getStorage().bucket().file(cvPath).delete();
    } catch { /* file may not exist */ }
  }

  // Delete application
  await db.doc(`applications/${applicationId}`).delete();

  // Log deletion for audit
  console.log(`Application ${applicationId} deleted by ${user.email}`);

  res.status(200).json({ message: "Application deleted" });
});

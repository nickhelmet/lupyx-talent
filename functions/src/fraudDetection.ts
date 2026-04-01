import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";

export const fraudAnalysis = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "fraudAnalysis", user.uid))) return;

  const { applicationId } = req.body;
  if (!applicationId) { res.status(400).json({ error: "Missing applicationId" }); return; }

  const db = getFirestore();
  const appDoc = await db.doc(`applications/${applicationId}`).get();
  if (!appDoc.exists) { res.status(404).json({ error: "Application not found" }); return; }

  const appData = appDoc.data()!;
  const flags: string[] = [];

  // Check duplicate by email + job
  const emailDups = await db.collection("applications")
    .where("email", "==", appData.email)
    .where("jobId", "==", appData.jobId)
    .get();
  if (emailDups.size > 1) flags.push("DUPLICATE_EMAIL_JOB");

  // Check duplicate by DNI + job
  if (appData.dni) {
    const dniDups = await db.collection("applications")
      .where("dni", "==", appData.dni)
      .where("jobId", "==", appData.jobId)
      .get();
    if (dniDups.size > 1) flags.push("DUPLICATE_DNI_JOB");
  }

  // Check CV hash duplicates
  if (appData.cvHash) {
    const cvDups = await db.collection("applications")
      .where("cvHash", "==", appData.cvHash)
      .get();
    if (cvDups.size > 1) flags.push("DUPLICATE_CV_HASH");
  }

  // Check multiple applications from same user in short period
  const userApps = await db.collection("applications")
    .where("userId", "==", appData.userId)
    .get();
  if (userApps.size > 5) flags.push("HIGH_APPLICATION_VOLUME");

  res.status(200).json({
    applicationId,
    flags,
    isSuspicious: flags.length > 0,
    checkedAt: new Date().toISOString(),
  });
});

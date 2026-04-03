import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";

export const adminUsage = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const db = getFirestore();

  try {
    // Firestore stats
    const [jobsSnap, appsSnap, usersSnap, rateLimitSnap] = await Promise.all([
      db.collection("jobs").get(),
      db.collection("applications").get(),
      db.collection("users").get(),
      db.collection("rate_limits").get(),
    ]);

    // Count applications by date (last 7 days)
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const appsByDay: Record<string, number> = {};
    appsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const ts = data.appliedAt?._seconds ? data.appliedAt._seconds * 1000 : new Date(data.appliedAt || 0).getTime();
      if (ts > weekAgo) {
        const day = new Date(ts).toISOString().split("T")[0];
        appsByDay[day] = (appsByDay[day] || 0) + 1;
      }
    });

    // CV analysis count
    const analyzedCvs = appsSnap.docs.filter((d) => d.data().cvAnalysis).length;

    // Storage usage
    let storageFiles = 0;
    let storageBytes = 0;
    try {
      const bucket = getStorage().bucket();
      const [files] = await bucket.getFiles({ prefix: "cvs/" });
      storageFiles = files.length;
      files.forEach((f) => { storageBytes += parseInt(String(f.metadata.size || 0)); });
    } catch { /* bucket may not exist */ }

    // Status distribution
    const statusDist: Record<string, number> = {};
    appsSnap.docs.forEach((d) => {
      const s = d.data().status || "UNKNOWN";
      statusDist[s] = (statusDist[s] || 0) + 1;
    });

    // Jobs status
    const jobsDist: Record<string, number> = {};
    jobsSnap.docs.forEach((d) => {
      const s = d.data().status || "UNKNOWN";
      jobsDist[s] = (jobsDist[s] || 0) + 1;
    });

    res.status(200).json({
      firestore: {
        totalJobs: jobsSnap.size,
        totalApplications: appsSnap.size,
        totalUsers: usersSnap.size,
        rateLimitEntries: rateLimitSnap.size,
      },
      storage: {
        files: storageFiles,
        bytesUsed: storageBytes,
        mbUsed: Math.round(storageBytes / 1024 / 1024 * 100) / 100,
      },
      gemini: {
        analyzedCvs,
      },
      applicationsByDay: appsByDay,
      statusDistribution: statusDist,
      jobsDistribution: jobsDist,
    });
  } catch (error) {
    console.error("adminUsage error:", error);
    res.status(500).json({ error: "Failed to get usage data" });
  }
});

import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";

export const createJob = onRequest({ maxInstances: 3 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "createJob", user.uid))) return;

  const { title, company, description, requirements, location, type, slug, linkedinUrl, tags } = req.body;
  if (!title || !company || !description) {
    res.status(400).json({ error: "Missing required fields" }); return;
  }

  const db = getFirestore();
  const jobSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const job = {
    title, company, description, requirements: requirements || "",
    location: location || "", type: type || "CONTRACT",
    status: "ACTIVE", slug: jobSlug,
    linkedinUrl: linkedinUrl || null, tags: tags || [],
    image: null,
    postedDate: new Date().toISOString(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await db.collection("jobs").doc(jobSlug).set(job);
  res.status(201).json({ id: jobSlug, message: "Job created" });
});

export const updateJob = onRequest({ maxInstances: 3 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "updateJob", user.uid))) return;

  const { jobId, ...updates } = req.body;
  if (!jobId) { res.status(400).json({ error: "Missing jobId" }); return; }

  const db = getFirestore();
  await db.doc(`jobs/${jobId}`).update({ ...updates, updatedAt: FieldValue.serverTimestamp() });
  res.status(200).json({ message: "Job updated" });
});

export const updateJobStatus = onRequest({ maxInstances: 3 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "updateJobStatus", user.uid))) return;

  const { jobId, status } = req.body;
  if (!jobId || !["ACTIVE", "PAUSED", "CLOSED"].includes(status)) {
    res.status(400).json({ error: "Invalid jobId or status" }); return;
  }

  const db = getFirestore();
  await db.doc(`jobs/${jobId}`).update({ status, updatedAt: FieldValue.serverTimestamp() });
  res.status(200).json({ message: `Job status updated to ${status}` });
});

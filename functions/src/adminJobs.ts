import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";
import { sanitizeString, validateJobStatus } from "./validation";

export const createJob = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "createJob", user.uid))) return;

  const raw = req.body;
  const title = sanitizeString(raw.title).slice(0, 200);
  const company = sanitizeString(raw.company).slice(0, 200);
  const description = sanitizeString(raw.description).slice(0, 10000);

  if (!title || !company || !description) {
    res.status(400).json({ error: "Missing required fields: title, company, description" }); return;
  }

  const requirements = sanitizeString(raw.requirements).slice(0, 10000);
  const location = sanitizeString(raw.location).slice(0, 200);
  const type = validateJobStatus(raw.type) ? raw.type : "CONTRACT";
  const linkedinUrl = typeof raw.linkedinUrl === "string" && raw.linkedinUrl.startsWith("https://") ? raw.linkedinUrl.slice(0, 500) : null;
  const tags = Array.isArray(raw.tags) ? raw.tags.filter((t: unknown) => typeof t === "string").map((t: string) => sanitizeString(t).slice(0, 50)).slice(0, 20) : [];

  const db = getFirestore();
  const baseSlug = typeof raw.slug === "string" ? raw.slug.replace(/[^a-z0-9-]/g, "").slice(0, 100) : title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // Ensure unique slug
  let slug = baseSlug;
  const existing = await db.doc(`jobs/${slug}`).get();
  if (existing.exists) {
    const suffix = Date.now().toString(36).slice(-4);
    slug = `${baseSlug}-${suffix}`;
  }

  // Screening questions (max 10)
  const screeningQuestions = Array.isArray(raw.screeningQuestions)
    ? raw.screeningQuestions.slice(0, 10).map((q: { text?: string; type?: string; required?: boolean; options?: string[] }, i: number) => ({
        id: `q${i + 1}`,
        text: sanitizeString(typeof q.text === "string" ? q.text : "").slice(0, 500),
        type: ["text", "yesno", "select", "number"].includes(q.type || "") ? q.type : "text",
        required: !!q.required,
        options: q.type === "select" && Array.isArray(q.options)
          ? q.options.slice(0, 10).map((o: string) => sanitizeString(o).slice(0, 100)).filter(Boolean)
          : [],
      })).filter((q: { text: string }) => q.text.length > 0)
    : [];

  const job = {
    title, company, description, requirements,
    location, type: type || "CONTRACT",
    status: "ACTIVE", slug,
    linkedinUrl, tags,
    screeningQuestions,
    image: null,
    postedDate: new Date().toISOString(),
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await db.collection("jobs").doc(slug).set(job);
  res.status(201).json({ id: slug, message: "Job created" });
});

export const updateJob = onRequest({ maxInstances: 1 }, async (req, res) => {
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

export const updateJobStatus = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "updateJobStatus", user.uid))) return;

  const jobId = typeof req.body.jobId === "string" ? req.body.jobId.replace(/[^a-zA-Z0-9_-]/g, "") : "";
  const status = validateJobStatus(req.body.status);
  if (!jobId || !status) {
    res.status(400).json({ error: "Invalid jobId or status" }); return;
  }

  const db = getFirestore();
  await db.doc(`jobs/${jobId}`).update({ status, updatedAt: FieldValue.serverTimestamp() });
  res.status(200).json({ message: `Job status updated to ${status}` });
});

export const adminListJobs = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const db = getFirestore();
  const snapshot = await db.collection("jobs").orderBy("postedDate", "desc").get();
  const jobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  res.status(200).json(jobs);
});

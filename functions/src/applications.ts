import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";

export const submitApplication = onRequest({ maxInstances: 5 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));

  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const {
      jobId, firstName, lastName, phone, address, city,
      birthDate, educationLevel, dni, coverLetter,
    } = req.body;

    if (!jobId || !firstName || !lastName || !phone) {
      res.status(400).json({ error: "Missing required fields: jobId, firstName, lastName, phone" });
      return;
    }

    const db = getFirestore();

    // Check job exists and is active
    const jobDoc = await db.doc(`jobs/${jobId}`).get();
    if (!jobDoc.exists || jobDoc.data()?.status !== "ACTIVE") {
      res.status(404).json({ error: "Job not found or not active" });
      return;
    }

    // Check duplicate application
    const existing = await db.collection("applications")
      .where("userId", "==", user.uid)
      .where("jobId", "==", jobId)
      .limit(1)
      .get();

    if (!existing.empty) {
      res.status(409).json({ error: "You have already applied to this job" });
      return;
    }

    const jobData = jobDoc.data()!;
    const application = {
      userId: user.uid,
      jobId,
      jobTitle: jobData.title,
      jobCompany: jobData.company,
      firstName,
      lastName,
      email: user.email,
      phone,
      address: address || null,
      city: city || null,
      birthDate: birthDate || null,
      educationLevel: educationLevel || null,
      dni: dni || null,
      coverLetter: coverLetter || null,
      cvPath: null,
      cvHash: null,
      cvSize: null,
      status: "PENDING",
      appliedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      scores: null,
      interviewMeta: null,
    };

    const ref = await db.collection("applications").add(application);

    res.status(201).json({ id: ref.id, message: "Application submitted successfully" });
  } catch (error) {
    console.error("submitApplication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const listApplications = onRequest({ maxInstances: 5 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));

  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const db = getFirestore();
    const snapshot = await db.collection("applications")
      .where("userId", "==", user.uid)
      .orderBy("appliedAt", "desc")
      .get();

    const apps = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(apps);
  } catch (error) {
    console.error("listApplications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

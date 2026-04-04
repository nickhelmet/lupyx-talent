import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { createHash } from "crypto";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";
import { createNotification } from "./notifications";
import { sanitizeString, validatePhone, validateDNI, validateEducationLevel } from "./validation";
import { sendApplicationConfirmation, sendNewApplicationAlert } from "./email";

export const submitApplication = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));

  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (!(await rateLimit(req, res, "submitApplication", user.uid))) return;

  try {
    const raw = req.body;

    const firstName = sanitizeString(raw.firstName);
    const lastName = sanitizeString(raw.lastName);
    const phone = validatePhone(raw.phone);
    const jobId = typeof raw.jobId === "string" ? raw.jobId.replace(/[^a-zA-Z0-9_-]/g, "") : "";

    if (!jobId || !firstName || !lastName || !phone) {
      res.status(400).json({ error: "Missing or invalid required fields: jobId, firstName, lastName, phone" });
      return;
    }

    const address = sanitizeString(raw.address) || null;
    const city = sanitizeString(raw.city) || null;
    const birthDate = typeof raw.birthDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw.birthDate) ? raw.birthDate : null;
    const educationLevel = validateEducationLevel(raw.educationLevel);
    const dni = validateDNI(raw.dni);
    const coverLetter = sanitizeString(raw.coverLetter)?.slice(0, 5000) || null;
    const cvFileName = typeof raw.cvFileName === "string" ? raw.cvFileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 255) : null;
    const cvBase64 = typeof raw.cvBase64 === "string" ? raw.cvBase64 : null;

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

    // Upload CV to Firebase Storage
    let cvPath: string | null = null;
    let cvHash: string | null = null;
    let cvSize: number | null = null;

    if (cvBase64 && cvFileName) {
      const buffer = Buffer.from(cvBase64, "base64");

      // Validate PDF magic bytes
      if (buffer.length < 4 || buffer.subarray(0, 4).toString() !== "%PDF") {
        console.warn(`Rejected PDF upload: invalid magic bytes from ${user.email}`);
        res.status(400).json({ error: "Invalid PDF file" }); return;
      }

      if (buffer.length > 5 * 1024 * 1024) {
        console.warn(`Rejected PDF upload: too large (${buffer.length} bytes) from ${user.email}`);
        res.status(400).json({ error: "File too large (max 5MB)" }); return;
      }

      // Log suspicious PDF content (monitor mode — don't block legitimate PDFs)
      const content = buffer.toString("latin1");
      if (content.includes("/JavaScript") || content.includes("/JS ")) {
        console.warn(`PDF upload warning: contains JavaScript strings from ${user.email}`);
      }
      if (content.includes("/OpenAction") || content.includes("/AA ")) {
        console.warn(`PDF upload warning: contains auto-action strings from ${user.email}`);
      }

      cvHash = createHash("sha256").update(buffer).digest("hex");
      cvSize = buffer.length;
      cvPath = `cvs/${user.uid}/${Date.now()}-${cvFileName.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      const bucket = getStorage().bucket();
      await bucket.file(cvPath).save(buffer, {
        contentType: "application/pdf",
        metadata: { cacheControl: "private, max-age=31536000" },
      });
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
      cvPath,
      cvHash,
      cvSize,
      status: "PENDING",
      appliedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      scores: null,
      interviewMeta: null,
    };

    const ref = await db.collection("applications").add(application);

    // Auto-add/update candidate in talent pool
    try {
      const candidateQuery = await db.collection("candidates")
        .where("email", "==", user.email)
        .limit(1)
        .get();

      if (candidateQuery.empty) {
        await db.collection("candidates").add({
          firstName,
          lastName,
          email: user.email,
          phone: phone || null,
          city: city || null,
          skills: [],
          notes: null,
          tags: [],
          source: "application",
          cvPath: cvPath || null,
          cvAnalysis: null,
          matchHistory: [{ jobId, jobTitle: jobData.title, applicationId: ref.id, date: new Date().toISOString() }],
          createdBy: "system",
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp(),
        });
      } else {
        const candidateDoc = candidateQuery.docs[0];
        const existing = candidateDoc.data();
        const history = Array.isArray(existing.matchHistory) ? existing.matchHistory : [];
        history.push({ jobId, jobTitle: jobData.title, applicationId: ref.id, date: new Date().toISOString() });
        await candidateDoc.ref.update({
          phone: phone || existing.phone || null,
          city: city || existing.city || null,
          cvPath: cvPath || existing.cvPath || null,
          matchHistory: history,
          updatedAt: FieldValue.serverTimestamp(),
        });
      }
    } catch (candidateError) {
      console.error("Failed to upsert candidate:", candidateError);
    }

    // Notify admins + send emails
    try {
      const allowlistDoc = await db.doc("config/allowlist").get();
      const admins: string[] = allowlistDoc.data()?.admin_emails ?? [];
      const usersSnap = await db.collection("users").where("email", "in", admins.slice(0, 10)).get();
      for (const adminDoc of usersSnap.docs) {
        await createNotification(
          adminDoc.id,
          "NEW_APPLICATION",
          "Nueva postulación",
          `${firstName} ${lastName} se postuló a ${jobData.title}`,
        );
      }
      // Email: confirm to candidate
      await sendApplicationConfirmation(user.email, firstName, jobData.title, jobData.company);
      // Email: alert admins
      await sendNewApplicationAlert(admins, `${firstName} ${lastName}`, user.email, jobData.title);
    } catch (notifError) {
      console.error("Failed to send notifications/emails:", notifError);
    }

    res.status(201).json({ id: ref.id, message: "Application submitted successfully" });
  } catch (error) {
    console.error("submitApplication error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export const listApplications = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));

  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (!(await rateLimit(req, res, "listApplications", user.uid))) return;

  try {
    const db = getFirestore();
    const snapshot = await db.collection("applications")
      .where("userId", "==", user.uid)
      .orderBy("appliedAt", "desc")
      .get();

    const apps = snapshot.docs.map((doc) => {
      const data: Record<string, unknown> = { id: doc.id, ...doc.data() };
      // Filter out internal comments — candidate should not see them
      if (Array.isArray(data.comments)) {
        data.comments = data.comments.filter((c: { isInternal?: boolean }) => !c.isInternal);
      }
      // Remove cvAnalysis — admin-only data
      delete data.cvAnalysis;
      return data;
    });
    res.status(200).json(apps);
  } catch (error) {
    console.error("listApplications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";
import { rateLimit } from "./rateLimiter";
import { validateEmail } from "./validation";

export const getAllowlist = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }
  if (!(await rateLimit(req, res, "adminDashboard", user.uid))) return;

  const db = getFirestore();
  const doc = await db.doc("config/allowlist").get();
  res.status(200).json(doc.data() || { allowed_emails: [], admin_emails: [], blocked_emails: [] });
});

export const addAllowlistEmail = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const email = validateEmail(req.body.email);
  const list = req.body.list; // "allowed_emails" | "admin_emails"
  if (!email || !["allowed_emails", "admin_emails"].includes(list)) {
    res.status(400).json({ error: "Invalid email or list" }); return;
  }

  const db = getFirestore();
  await db.doc("config/allowlist").update({
    [list]: FieldValue.arrayUnion(email),
    updated_at: new Date().toISOString(),
    updated_by: user.email,
  });
  res.status(200).json({ message: `${email} added to ${list}` });
});

export const removeAllowlistEmail = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const email = validateEmail(req.body.email);
  const list = req.body.list;
  if (!email || !["allowed_emails", "admin_emails", "blocked_emails"].includes(list)) {
    res.status(400).json({ error: "Invalid email or list" }); return;
  }

  const db = getFirestore();
  await db.doc("config/allowlist").update({
    [list]: FieldValue.arrayRemove(email),
    updated_at: new Date().toISOString(),
    updated_by: user.email,
  });
  res.status(200).json({ message: `${email} removed from ${list}` });
});

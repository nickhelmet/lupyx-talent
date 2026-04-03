import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { rateLimit } from "./rateLimiter";
import { validateEmail } from "./validation";

export const subscribe = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }
  if (!(await rateLimit(req, res, "submitApplication"))) return;

  const email = validateEmail(req.body.email);
  if (!email) { res.status(400).json({ error: "Invalid email" }); return; }

  const db = getFirestore();
  await db.doc(`subscribers/${email.replace(/[^a-zA-Z0-9]/g, "_")}`).set({
    email,
    subscribedAt: new Date().toISOString(),
  }, { merge: true });

  res.status(200).json({ message: "Subscribed" });
});

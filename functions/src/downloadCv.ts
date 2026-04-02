import { onRequest } from "firebase-functions/v2/https";
import { getStorage } from "firebase-admin/storage";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";

export const downloadCv = onRequest({ maxInstances: 1 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const path = typeof req.body.path === "string" ? req.body.path : "";
  if (!path || !path.startsWith("cvs/")) {
    res.status(400).json({ error: "Invalid path" }); return;
  }

  try {
    const bucket = getStorage().bucket();
    const [url] = await bucket.file(path).getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000,
    });
    res.status(200).json({ url });
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});

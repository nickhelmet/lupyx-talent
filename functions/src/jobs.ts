import { onRequest } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";

export const listJobs = onRequest({ maxInstances: 10 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));

  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  try {
    const db = getFirestore();
    const snapshot = await db
      .collection("jobs")
      .where("status", "==", "ACTIVE")
      .orderBy("postedDate", "desc")
      .get();

    const jobs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    res.set("Cache-Control", "public, max-age=300");
    res.status(200).json(jobs);
  } catch (error) {
    console.error("listJobs error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

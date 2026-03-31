import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";

export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
) {
  const db = getFirestore();
  await db.collection("notifications").add({
    userId,
    type,
    title,
    message,
    read: false,
    createdAt: FieldValue.serverTimestamp(),
  });
}

export const getNotifications = onRequest({ maxInstances: 5 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const db = getFirestore();
  const snapshot = await db.collection("notifications")
    .where("userId", "==", user.uid)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const notifications = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  res.status(200).json(notifications);
});

export const markNotificationRead = onRequest({ maxInstances: 5 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { notificationId } = req.body;
  if (!notificationId) { res.status(400).json({ error: "Missing notificationId" }); return; }

  const db = getFirestore();
  const doc = await db.doc(`notifications/${notificationId}`).get();
  if (!doc.exists || doc.data()?.userId !== user.uid) {
    res.status(404).json({ error: "Not found" }); return;
  }

  await db.doc(`notifications/${notificationId}`).update({ read: true });
  res.status(200).json({ message: "Marked as read" });
});

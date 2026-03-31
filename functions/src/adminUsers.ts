import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";

export const listUsers = onRequest({ maxInstances: 5 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const db = getFirestore();
  const snapshot = await db.collection("users").orderBy("createdAt", "desc").limit(100).get();
  const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
  res.status(200).json(users);
});

export const updateUserRole = onRequest({ maxInstances: 3 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const { uid, role } = req.body;
  if (!uid || !["USER", "ADMIN"].includes(role)) {
    res.status(400).json({ error: "Invalid uid or role" }); return;
  }

  const db = getFirestore();
  await db.doc(`users/${uid}`).update({ role, updatedAt: FieldValue.serverTimestamp() });

  // Update allowlist if promoting to admin
  if (role === "ADMIN") {
    const userDoc = await db.doc(`users/${uid}`).get();
    const email = userDoc.data()?.email;
    if (email) {
      await db.doc("config/allowlist").update({
        admin_emails: FieldValue.arrayUnion(email),
      });
    }
  }

  res.status(200).json({ message: `Role updated to ${role}` });
});

export const toggleUserStatus = onRequest({ maxInstances: 3 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const { uid, isActive } = req.body;
  if (!uid || typeof isActive !== "boolean") {
    res.status(400).json({ error: "Invalid uid or isActive" }); return;
  }

  const db = getFirestore();
  await db.doc(`users/${uid}`).update({ isActive, updatedAt: FieldValue.serverTimestamp() });

  // Block/unblock in allowlist
  const userDoc = await db.doc(`users/${uid}`).get();
  const email = userDoc.data()?.email;
  if (email) {
    if (!isActive) {
      await db.doc("config/allowlist").update({ blocked_emails: FieldValue.arrayUnion(email) });
    } else {
      await db.doc("config/allowlist").update({ blocked_emails: FieldValue.arrayRemove(email) });
    }
  }

  res.status(200).json({ message: `User ${isActive ? "activated" : "deactivated"}` });
});

export const adminDashboard = onRequest({ maxInstances: 3 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "GET") { res.status(405).json({ error: "Method not allowed" }); return; }

  const user = await verifyAuth(req);
  if (!user?.isAdmin) { res.status(403).json({ error: "Forbidden" }); return; }

  const db = getFirestore();
  const [jobsSnap, appsSnap, usersSnap] = await Promise.all([
    db.collection("jobs").where("status", "==", "ACTIVE").get(),
    db.collection("applications").get(),
    db.collection("users").get(),
  ]);

  const pendingApps = appsSnap.docs.filter((d) => d.data().status === "PENDING").length;

  res.status(200).json({
    activeJobs: jobsSnap.size,
    totalApplications: appsSnap.size,
    pendingApplications: pendingApps,
    totalUsers: usersSnap.size,
  });
});

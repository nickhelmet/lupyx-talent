import { onRequest } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getCorsHeaders } from "./corsConfig";
import { verifyAuth } from "./authMiddleware";

export const userProfile = onRequest({ maxInstances: 10 }, async (req, res) => {
  const cors = getCorsHeaders(req.headers.origin ?? null);
  Object.entries(cors).forEach(([k, v]) => res.set(k, v));

  if (req.method === "OPTIONS") { res.status(204).send(""); return; }

  const user = await verifyAuth(req);
  if (!user) { res.status(401).json({ error: "Unauthorized" }); return; }

  const db = getFirestore();

  if (req.method === "GET") {
    const doc = await db.doc(`users/${user.uid}`).get();
    if (!doc.exists) {
      res.status(404).json({ error: "Profile not found" });
      return;
    }
    res.status(200).json({ uid: user.uid, ...doc.data() });
    return;
  }

  if (req.method === "POST") {
    const { firstName, lastName, phone, address, city, dni, birthDate, educationLevel } = req.body;

    await db.doc(`users/${user.uid}`).set(
      {
        email: user.email,
        firstName: firstName || null,
        lastName: lastName || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
        dni: dni || null,
        birthDate: birthDate || null,
        educationLevel: educationLevel || null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );

    res.status(200).json({ message: "Profile updated" });
    return;
  }

  res.status(405).json({ error: "Method not allowed" });
});

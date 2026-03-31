import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { Request } from "firebase-functions/v2/https";

export interface AuthenticatedUser {
  uid: string;
  email: string;
  isAdmin: boolean;
}

let cachedAllowlist: { admins: string[]; blocked: string[]; ts: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getAllowlist() {
  if (cachedAllowlist && Date.now() - cachedAllowlist.ts < CACHE_TTL) {
    return cachedAllowlist;
  }
  const db = getFirestore();
  const doc = await db.doc("config/allowlist").get();
  const data = doc.data();
  cachedAllowlist = {
    admins: data?.admin_emails ?? [],
    blocked: data?.blocked_emails ?? [],
    ts: Date.now(),
  };
  return cachedAllowlist;
}

export async function verifyAuth(req: Request): Promise<AuthenticatedUser | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.split("Bearer ")[1];
    const decoded = await getAuth().verifyIdToken(token);
    const email = decoded.email;
    if (!email) return null;

    const allowlist = await getAllowlist();
    if (allowlist.blocked.includes(email)) return null;

    return {
      uid: decoded.uid,
      email,
      isAdmin: allowlist.admins.includes(email),
    };
  } catch {
    return null;
  }
}

import { getFirebaseAuth, getAppCheck } from "@/lib/firebase";
import { getToken } from "firebase/app-check";

const API_BASE =
  process.env.NEXT_PUBLIC_USE_EMULATORS === "true"
    ? "http://localhost:5001/lupyx-talent/us-central1"
    : "https://us-central1-lupyx-talent.cloudfunctions.net";

export async function adminFetch(endpoint: string, options?: RequestInit) {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...(options?.headers as Record<string, string>),
  };

  // App Check token
  try {
    const appCheck = getAppCheck();
    if (appCheck) {
      const acResult = await getToken(appCheck, false);
      headers["X-Firebase-AppCheck"] = acResult.token;
    }
  } catch {
    // Continue without App Check in dev
  }

  const res = await fetch(`${API_BASE}/${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  return res.json();
}

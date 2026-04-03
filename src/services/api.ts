import { getFirebaseAuth } from "@/lib/firebase";
import { getToken } from "firebase/app-check";
import { getAppCheck } from "@/lib/firebase";

const API_BASE =
  process.env.NEXT_PUBLIC_USE_EMULATORS === "true"
    ? "http://localhost:5001/lupyx-talent/us-central1"
    : "https://us-central1-lupyx-talent.cloudfunctions.net";

async function getAppCheckToken(): Promise<string | null> {
  try {
    const appCheck = getAppCheck();
    if (!appCheck) return null;
    const result = await getToken(appCheck, false);
    return result.token;
  } catch {
    return null;
  }
}

async function authFetch(url: string, options: RequestInit = {}) {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken(true);
  const appCheckToken = await getAppCheckToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers as Record<string, string>,
  };

  if (appCheckToken) {
    headers["X-Firebase-AppCheck"] = appCheckToken;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error.error || "Request failed");
  }
  return res.json();
}

export async function fetchJobs() {
  const res = await fetch(`${API_BASE}/listJobs`);
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

export async function submitApplication(data: Record<string, unknown>) {
  return authFetch(`${API_BASE}/submitApplication`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fetchMyApplications() {
  return authFetch(`${API_BASE}/listApplications`);
}

export async function fetchProfile() {
  return authFetch(`${API_BASE}/userProfile`);
}

export async function updateProfile(data: Record<string, unknown>) {
  return authFetch(`${API_BASE}/userProfile`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

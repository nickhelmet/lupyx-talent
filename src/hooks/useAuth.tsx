"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { track } from "@/lib/analytics";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  async function loginWithGoogle() {
    const auth = getFirebaseAuth();
    const result = await signInWithPopup(auth, new GoogleAuthProvider());
    if (result.user) {
      track.login();
      // Create user profile on first login (fire and forget)
      try {
        const token = await result.user.getIdToken();
        const { getAppCheck } = await import("@/lib/firebase");
        const appCheck = getAppCheck();
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };
        if (appCheck) {
          const { getToken } = await import("firebase/app-check");
          const acToken = await getToken(appCheck, false);
          headers["X-Firebase-AppCheck"] = acToken.token;
        }
        const apiBase = process.env.NEXT_PUBLIC_USE_EMULATORS === "true"
          ? "http://localhost:5001/lupyx-talent/us-central1"
          : "https://us-central1-lupyx-talent.cloudfunctions.net";
        await fetch(`${apiBase}/userProfile`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            firstName: result.user.displayName?.split(" ")[0] || "",
            lastName: result.user.displayName?.split(" ").slice(1).join(" ") || "",
          }),
        });
      } catch {
        // Non-blocking — profile will be created later
      }
    }
  }

  async function logout() {
    const auth = getFirebaseAuth();
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

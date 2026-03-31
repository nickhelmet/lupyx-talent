// Environment detection for Firebase Emulators vs Production

export function isEmulator(): boolean {
  return process.env.NEXT_PUBLIC_USE_EMULATORS === "true";
}

export function getApiBase(): string {
  if (isEmulator()) {
    return "http://localhost:5001/lupyx-talent/us-central1";
  }
  return "https://us-central1-lupyx-talent.cloudfunctions.net";
}

export function getEnvironment(): "development" | "staging" | "production" {
  if (isEmulator()) return "development";
  if (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.includes("staging")) return "staging";
  return "production";
}

import { getAppCheck } from "firebase-admin/app-check";

/**
 * Verify Firebase App Check token.
 * Returns true if valid, false if invalid or missing.
 *
 * When enforced, requests without a valid App Check token are rejected.
 * This blocks bots, scripts, and direct curl requests.
 */
export async function verifyAppCheck(
  req: { headers: Record<string, string | string[] | undefined> },
): Promise<boolean> {
  const appCheckToken = req.headers["x-firebase-appcheck"];

  if (!appCheckToken || typeof appCheckToken !== "string") {
    return false;
  }

  try {
    await getAppCheck().verifyToken(appCheckToken);
    return true;
  } catch {
    return false;
  }
}

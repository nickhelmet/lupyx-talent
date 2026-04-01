import { getAppCheck } from "firebase-admin/app-check";

// App Check mode: "monitor" logs warnings but allows requests through.
// Change to "enforce" once verified working in production.
const APP_CHECK_MODE: "monitor" | "enforce" = "monitor";

/**
 * Verify Firebase App Check token.
 * In "monitor" mode: logs warning but returns true (allows request).
 * In "enforce" mode: returns false (blocks request).
 */
export async function verifyAppCheck(
  req: { headers: Record<string, string | string[] | undefined> },
): Promise<boolean> {
  const appCheckToken = req.headers["x-firebase-appcheck"];

  if (!appCheckToken || typeof appCheckToken !== "string") {
    if (APP_CHECK_MODE === "enforce") {
      console.warn("App Check: missing token — BLOCKED");
      return false;
    }
    console.warn("App Check: missing token — allowed (monitor mode)");
    return true;
  }

  try {
    await getAppCheck().verifyToken(appCheckToken);
    return true;
  } catch (error) {
    const msg = error instanceof Error ? error.message : "unknown";
    if (APP_CHECK_MODE === "enforce") {
      console.warn(`App Check: invalid token — BLOCKED: ${msg}`);
      return false;
    }
    console.warn(`App Check: invalid token — allowed (monitor mode): ${msg}`);
    return true;
  }
}

import { getAnalytics, logEvent, isSupported, type Analytics } from "firebase/analytics";
import { getApps } from "firebase/app";

let analytics: Analytics | null = null;
let initPromise: Promise<Analytics | null> | null = null;

function init(): Promise<Analytics | null> {
  if (analytics) return Promise.resolve(analytics);
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (typeof window === "undefined") return null;
    if (!(await isSupported())) return null;
    const apps = getApps();
    if (apps.length === 0) return null;
    analytics = getAnalytics(apps[0]);
    return analytics;
  })();

  return initPromise;
}

export async function trackEvent(name: string, params?: Record<string, string | number>) {
  const a = await init();
  if (!a) return;
  logEvent(a, name, params);
}

export const track = {
  pageView: (page: string) => trackEvent("page_view", { page_path: page }),
  jobView: (jobId: string, jobTitle: string) => trackEvent("job_view", { job_id: jobId, job_title: jobTitle }),
  jobApplyStart: (jobId: string) => trackEvent("job_apply_start", { job_id: jobId }),
  jobApplyComplete: (jobId: string) => trackEvent("job_apply_complete", { job_id: jobId }),
  linkedinClick: () => trackEvent("linkedin_click"),
  instagramClick: () => trackEvent("instagram_click"),
  contactClick: (method: string) => trackEvent("contact_click", { method }),
  login: () => trackEvent("login", { method: "google" }),
  signup: () => trackEvent("sign_up", { method: "google" }),
  darkModeToggle: (mode: string) => trackEvent("dark_mode_toggle", { mode }),
};

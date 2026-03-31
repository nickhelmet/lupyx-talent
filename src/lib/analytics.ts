import { getAnalytics, logEvent, isSupported } from "firebase/analytics";
import { getApps } from "firebase/app";

let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;

async function getAnalyticsInstance() {
  if (analyticsInstance) return analyticsInstance;
  if (typeof window === "undefined") return null;
  if (!(await isSupported())) return null;
  const apps = getApps();
  if (apps.length === 0) return null;
  analyticsInstance = getAnalytics(apps[0]);
  return analyticsInstance;
}

export async function trackEvent(name: string, params?: Record<string, string | number>) {
  const analytics = await getAnalyticsInstance();
  if (!analytics) return;
  logEvent(analytics, name, params);
}

// Pre-defined events
export const track = {
  jobView: (jobId: string) => trackEvent("job_view", { job_id: jobId }),
  jobApplyStart: (jobId: string) => trackEvent("job_apply_start", { job_id: jobId }),
  jobApplyComplete: (jobId: string) => trackEvent("job_apply_complete", { job_id: jobId }),
  linkedinClick: () => trackEvent("linkedin_click"),
  instagramClick: () => trackEvent("instagram_click"),
  contactClick: (method: string) => trackEvent("contact_click", { method }),
  login: () => trackEvent("login", { method: "google" }),
  signup: () => trackEvent("sign_up", { method: "google" }),
};

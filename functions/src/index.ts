import { initializeApp } from "firebase-admin/app";

initializeApp();

// Public
export { listJobs } from "./jobs";
export { subscribe } from "./subscribe";

// User (auth required)
export { submitApplication, listApplications } from "./applications";
export { withdrawApplication } from "./updateApplication";
export { userProfile } from "./userProfile";
export { getNotifications, markNotificationRead } from "./notifications";

// Admin
export { createJob, updateJob, updateJobStatus, adminListJobs } from "./adminJobs";
export { adminListApplications, updateApplicationStatus, addInterviewNotes, manageInterviewRounds } from "./adminApplications";
export { listUsers, updateUserRole, toggleUserStatus, adminDashboard } from "./adminUsers";
export { fraudAnalysis } from "./fraudDetection";
export { adminUsage } from "./adminUsage";
export { getAllowlist, addAllowlistEmail, removeAllowlistEmail } from "./adminAllowlist";
export { addComment, getApplicationDetail } from "./adminComments";
export { analyzeCv } from "./cvAnalysis";
export { downloadCv } from "./downloadCv";
export { deleteApplication } from "./adminDelete";
export { listCandidates, addCandidate, deleteCandidate } from "./candidates";

// SEO
export { sitemap } from "./sitemap";

// Scheduled — disabled to avoid costs while no production data (see issue #99)
// export { scheduledBackup } from "./backup";

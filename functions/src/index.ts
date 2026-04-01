import { initializeApp } from "firebase-admin/app";

initializeApp();

// Public
export { listJobs } from "./jobs";

// User (auth required)
export { submitApplication, listApplications } from "./applications";
export { userProfile } from "./userProfile";
export { getNotifications, markNotificationRead } from "./notifications";

// Admin
export { createJob, updateJob, updateJobStatus } from "./adminJobs";
export { adminListApplications, updateApplicationStatus, addInterviewNotes, manageInterviewRounds } from "./adminApplications";
export { listUsers, updateUserRole, toggleUserStatus, adminDashboard } from "./adminUsers";
export { fraudAnalysis } from "./fraudDetection";
export { getAllowlist, addAllowlistEmail, removeAllowlistEmail } from "./adminAllowlist";

// Scheduled — disabled to avoid costs while no production data (see issue #99)
// export { scheduledBackup } from "./backup";

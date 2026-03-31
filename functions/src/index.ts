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

// ============================================
// Lupyx Talent - Type Definitions
// ============================================

// --- Enums ---

export type Role = "USER" | "ADMIN";

export type JobType = "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP";

export type JobStatus = "ACTIVE" | "PAUSED" | "CLOSED";

export type ApplicationStatus =
  | "PENDING"
  | "REVIEWING"
  | "INTERVIEW"
  | "REJECTED"
  | "ACCEPTED"
  | "HIRED";

export type EducationLevel =
  | "PRIMARY"
  | "SECONDARY"
  | "TERTIARY"
  | "UNIVERSITY"
  | "POSTGRADUATE"
  | "MASTER"
  | "PHD";

export type InterviewType =
  | "PHONE"
  | "VIDEO"
  | "PRESENTIAL"
  | "TECHNICAL"
  | "HR"
  | "PANEL"
  | "CASE_STUDY";

export type InterviewStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "RESCHEDULED"
  | "NO_SHOW";

export type NotificationType =
  | "NEW_APPLICATION"
  | "STATUS_CHANGE"
  | "GENERAL"
  | "WELCOME";

// --- Models ---

export interface User {
  uid: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  role: Role;
  dni?: string;
  birthDate?: string;
  educationLevel?: EducationLevel;
  cvPath?: string;
  emailNotifications: boolean;
  jobAlerts: boolean;
  isActive: boolean;
  image?: string;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  summary?: string;
  skills: string[];
  languages: string[];
}

export interface WorkExperience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string;
  location: string;
  type: JobType;
  status: JobStatus;
  image?: string;
  slug: string;
  linkedinUrl?: string;
  tags?: string[];
  postedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  id: string;
  userId: string;
  jobId: string;
  jobTitle: string;
  jobCompany: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  birthDate?: string;
  educationLevel?: EducationLevel;
  dni?: string;
  coverLetter?: string;
  cvPath: string;
  cvHash?: string;
  cvSize?: number;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  scores?: ApplicationScores;
  interviewMeta?: InterviewMeta;
}

export interface ApplicationScores {
  technical?: number;
  communication?: number;
  experience?: number;
  motivation?: number;
  overall?: number;
}

export interface InterviewMeta {
  date?: string;
  interviewer?: string;
  notes?: string;
}

export interface InterviewRound {
  id: string;
  applicationId: string;
  roundNumber: number;
  type: InterviewType;
  scheduledDate?: string;
  completedDate?: string;
  location?: string;
  meetingLink?: string;
  duration?: number;
  status: InterviewStatus;
  interviewerName?: string;
  interviewerRole?: string;
  scores?: {
    technical?: number;
    communication?: number;
    culture?: number;
    overall?: number;
  };
  passed?: boolean;
  feedback?: string;
  nextSteps?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface AllowlistConfig {
  admin_emails: string[];
  blocked_emails: string[];
  updated_at?: string;
  updated_by?: string;
}

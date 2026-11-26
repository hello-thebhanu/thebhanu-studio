export type ProjectStatus =
  | "Enquiry Received"
  | "Requirements Review"
  | "Proposal / Discussion"
  | "Approved"
  | "In Progress"
  | "Under Review"
  | "Completed"
  | "Delivered";

export const PROJECT_LIFECYCLE_STATUSES: ProjectStatus[] = [
  "Enquiry Received",
  "Requirements Review",
  "Proposal / Discussion",
  "Approved",
  "In Progress",
  "Under Review",
  "Completed",
  "Delivered",
];

export interface CustomerProfileRecord {
  id: string;
  email: string;
  fullName: string;
  company: string;
  phone: string;
  role: "admin" | "customer";
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRecord {
  id: string;
  projectCode: string;
  title: string;
  description: string;
  projectType: string;
  customerId: string | null;
  customerEmail: string;
  enquiryId: string | null;
  status: ProjectStatus;
  budget: string;
  timeline: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectUpdateRecord {
  id: string;
  projectId: string;
  authorId: string | null;
  authorRole: "admin" | "customer";
  title: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

export interface ProjectFileRecord {
  id: string;
  projectId: string;
  uploadedBy: string | null;
  fileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  isDeliverable: boolean;
  createdAt: string;
}

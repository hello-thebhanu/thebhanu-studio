export type EnquiryStatus =
  | "New"
  | "Reviewing"
  | "Proposal Sent"
  | "Accepted"
  | "Archived";

export type ProjectTypeOption =
  | "Website Development"
  | "Full-Stack Application"
  | "Android Application"
  | "AI Solution"
  | "Automation Solution";

export interface EnquiryRecord {
  id: string;
  referenceCode: string;
  projectType: string;
  selectedFeatures: string[];
  techPreferences: string[];
  projectDescription: string;
  budgetRange: string;
  expectedTimeline: string;
  customerName: string;
  customerEmail: string;
  customerCompany: string | null;
  customerPhone: string | null;
  sourceProductSlug: string | null;
  status: EnquiryStatus;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnquiryPayload {
  idempotencyKey: string;
  projectType: ProjectTypeOption;
  selectedFeatures: string[];
  techPreferences: string[];
  projectDescription: string;
  budgetRange: string;
  expectedTimeline: string;
  customerName: string;
  customerEmail: string;
  customerCompany?: string;
  customerPhone?: string;
  sourceProductSlug?: string;
}

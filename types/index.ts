import { ApplicationStatus, EventType } from "@prisma/client";

export { ApplicationStatus, EventType };

export interface DocumentItem {
  id: string;
  fileName: string;
  fileKey: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
}

export interface EventItem {
  id: string;
  title: string;
  eventDate: Date;
  type: EventType;
  notes?: string | null;
}

export interface ApplicationWithDetails {
  id: string;
  company: string;
  position: string;
  location?: string | null;
  jobUrl?: string | null;
  salary?: string | null;
  appliedDate: Date;
  status: ApplicationStatus;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  events?: EventItem[];
  documents?: DocumentItem[];
}

export interface KanbanColumn {
  id: ApplicationStatus;
  title: string;
  color: string;
}
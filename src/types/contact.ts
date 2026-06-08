export type Gender = 'Male' | 'Female' | 'Other';

export interface Tag {
  id: string;
  name: string;
  color?: string;
}

export interface Note {
  id: string;
  contactId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityTimelineItem {
  id: string;
  type: 'creation' | 'update' | 'note_added' | 'tag_assigned' | 'system';
  description: string;
  timestamp: string;
}

export interface ActivitySummary {
  totalNotesCount: number;
  totalTagsCount: number;
  lastInteractionType: string;
}

// Unified Core Contact Entity
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  mobileNumber: string | null;
  gender?: Gender;
  dateOfBirth?: string;
  location?: string;
  tags: Tag[];
  createdAt: string;
  lastActivityAt: string;
  isDeleted: boolean;
}

// Deep Profile State Container Model
export interface ContactProfile {
  basicInfo: Contact;
  notes: Note[];
  activitySummary: ActivitySummary;
  activityTimeline: ActivityTimelineItem[];
}

// Import Job Worker Tracking Model
export interface ImportJob {
  importId: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed';
  totalRecords: number;
  processedRecords: number;
  successRecords: number;
  failedRecords: number;
  completionPercentage: number;
  createdAt: string;
}

// Common Generic Pagination Response Wrapper
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalRecords: number;
    hasPrevPage: boolean;
    hasNextPage: boolean;
  };
}
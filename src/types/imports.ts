export type ImportStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed';

export interface ImportErrorSummary {
  invalidRecordsCount: number;
  duplicateRecordsCount: number;
  failedRecordsCount: number;
  systemErrors?: string[];
}

// Background Processing Import Engine Object state descriptor
export interface ImportJob {
  importId: string;
  status: ImportStatus;
  totalRecords: number;
  processedRecords: number;
  successRecords: number;
  failedRecords: number;
  completionPercentage: number;
  createdAt: string;
  completedAt?: string;
  errorSummary?: ImportErrorSummary;
}

export interface ImportHistoryItem {
  importId: string;
  fileName: string;
  status: ImportStatus;
  createdAt: string;
  totalRecords: number;
  successCount: number;
  failureCount: number;
}
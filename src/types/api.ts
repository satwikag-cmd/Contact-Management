export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface PaginationResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    totalRecords: number;
    currentPage: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface ApiValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string; // e.g., "Duplicate contact constraint violation error"
  errorCode?: string;
  validationErrors?: ApiValidationErrorDetail[];
}
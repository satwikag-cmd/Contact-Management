export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // Standard 5MB configuration limit cap

export const validateCSVFile = (file: File | null): FileValidationResult => {
  if (!file) {
    return { isValid: false, error: 'Target submission structure is empty. Select a file.' };
  }

  // 1. File Extension Validation
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (fileExtension !== 'csv' && file.type !== 'text/csv') {
    return { isValid: false, error: 'Invalid file format. Only standard comma-separated (.csv) strings allowed.' };
  }

  // 2. Size Cap Limitation Check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { isValid: false, error: 'File size threshold exceeded. Maximum acceptable payload bound is 5MB.' };
  }

  // 3. Empty Content File Validation
  if (file.size === 0) {
    return { isValid: false, error: 'The uploaded file contains 0 bytes of content.' };
  }

  return { isValid: true };
};
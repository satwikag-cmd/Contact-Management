import { type CreateContactInput } from '../types/contact';

export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export const validateContactForm = (data: Partial<CreateContactInput>): FormValidationResult => {
  const errors: Record<string, string> = {};
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Standard enterprise phone structure validation match
  const phoneRegex = /^\+?[0-9\s\-()]{7,15}$/;

  // 1. First Name Mandatory Enforcement
  if (!data.firstName?.trim()) {
    errors.firstName = 'First name parameter is structurally mandatory.';
  }

  const hasEmail = !!data.email?.trim();
  const hasPhone = !!data.mobileNumber?.trim();

  // 2. Either Email OR Phone Requirement Check
  if (!hasEmail && !hasPhone) {
    errors.identityGroup = 'Operational requirement: Provide either an Email Address or a Mobile Number.';
    errors.email = 'Required if Mobile Number is absent.';
    errors.mobileNumber = 'Required if Email Address is absent.';
  }

  // 3. Format Structural Inspections
  if (hasEmail && !emailRegex.test(data.email!)) {
    errors.email = 'The provided email string format is invalid.';
  }

  if (hasPhone && !phoneRegex.test(data.mobileNumber!)) {
    errors.mobileNumber = 'The provided mobile string format is invalid.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
const ETHIOPIAN_TIN_REGEX = /^\d{9,15}$/;

const ETHIOPIAN_LICENSE_REGEX = /^[A-Za-z0-9/]{5,50}$/;

export interface TinValidationResult {
  valid: boolean;
  error?: string;
}

export function validateTin(tin: string): TinValidationResult {
  const trimmed = tin.trim();

  if (!trimmed) {
    return { valid: false, error: 'TIN is required' };
  }

  if (!ETHIOPIAN_TIN_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'TIN must be 9-15 digits (numeric only)',
    };
  }

  return { valid: true };
}

export function validateLicenseNo(licenseNo: string): TinValidationResult {
  const trimmed = licenseNo.trim();

  if (!trimmed) {
    return { valid: false, error: 'License number is required' };
  }

  if (!ETHIOPIAN_LICENSE_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Invalid license number format',
    };
  }

  return { valid: true };
}

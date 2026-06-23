export interface QrScanResponse {
  sessionId: string;
  status:
    | 'QR_RECEIVED'
    | 'PARSING_COMPLETE'
    | 'GOVERNMENT_VALIDATED'
    | 'OTP_PENDING'
    | 'VERIFIED'
    | 'FAILED';
  extractedData?: {
    source: string;
    type: string;
    licenseNo: string;
    tin: string;
  };
  failureReason?: string;
}

export interface OtpVerifyResponse {
  verified: boolean;
  failureReason?: string;
}

export type VerificationStep = 'scan' | 'result' | 'otp' | 'complete';

export interface VerificationState {
  step: VerificationStep;
  sessionId: string | null;
  scanResponse: QrScanResponse | null;
  businessName: string | null;
  error: string | null;
}

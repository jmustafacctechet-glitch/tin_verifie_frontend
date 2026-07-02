import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { OtpVerifyResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

async function verifyOtp(
  sessionId: string,
  otp: string,
): Promise<OtpVerifyResponse> {
  const response = await axios.post<{
    status: string;
    data: OtpVerifyResponse;
  }>(`${API_URL}/api/qr-verification/verify-otp`, { sessionId, otp });

  if (response.data.status !== 'success') {
    const failureReason =
      response.data.data?.failureReason || 'Verification failed';
    throw new Error(failureReason);
  }

  return response.data.data;
}

export function useOTPVerification() {
  return useMutation({
    mutationFn: ({ sessionId, otp }: { sessionId: string; otp: string }) =>
      verifyOtp(sessionId, otp),
  });
}

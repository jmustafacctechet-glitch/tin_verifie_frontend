import { useState, useCallback } from 'react';
import QRScanner from './QRScanner';
import VerificationResult from './VerificationResult';
import OtpInput from './OtpInput';
import { useQRScan } from '../hooks/useQRScan';
import { useOTPVerification } from '../hooks/useOTPVerification';
import type { VerificationStep, QrScanResponse } from '../types';

type FlowStatus = 'idle' | 'scanning' | 'verifying' | 'otp' | 'complete' | 'error';

export default function VerificationFlow() {
  const [flowStatus, setFlowStatus] = useState<FlowStatus>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [scanResponse, setScanResponse] = useState<QrScanResponse | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanMutation = useQRScan();
  const otpMutation = useOTPVerification();

  const handleScan = useCallback(
    async (qrData: string) => {
      setFlowStatus('scanning');
      setError(null);

      try {
        const result = await scanMutation.mutateAsync(qrData);
        setScanResponse(result);
        setSessionId(result.sessionId);

        if (result.status === 'FAILED') {
          setFlowStatus('error');
          setError(result.failureReason || 'Verification failed');
          return;
        }

        if (
          result.status === 'GOVERNMENT_VALIDATED' ||
          result.status === 'VERIFIED' ||
          result.status === 'OTP_PENDING'
        ) {
          setBusinessName(result.extractedData?.licenseNo || null);
        }

        if (result.status === 'OTP_PENDING') {
          setFlowStatus('otp');
        } else if (result.status === 'VERIFIED') {
          setFlowStatus('complete');
        } else {
          setFlowStatus('error');
        }
      } catch (err: any) {
        setFlowStatus('error');
        setError(
          err.response?.data?.message || err.message || 'Scan failed',
        );
      }
    },
    [scanMutation],
  );

  const handleOtpComplete = useCallback(
    async (otp: string) => {
      if (!sessionId) return;

      setFlowStatus('verifying');

      try {
        const result = await otpMutation.mutateAsync({
          sessionId,
          otp,
        });

        if (result.verified) {
          setFlowStatus('complete');
        } else {
          setError(
            result.failureReason || 'OTP verification failed',
          );
        }
      } catch (err: any) {
        setError(
          err.message || 'OTP verification failed',
        );
      }
    },
    [sessionId, otpMutation],
  );

  const handleReset = useCallback(() => {
    setFlowStatus('idle');
    setSessionId(null);
    setScanResponse(null);
    setBusinessName(null);
    setError(null);
  }, []);

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">
        Business License & TIN Verification
      </h2>

      {flowStatus === 'idle' && (
        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            Scan the QR code from an Ethiopian business license to verify
          </p>
          <QRScanner onScan={handleScan} />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>
        </div>
      )}

      {flowStatus === 'scanning' && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Verifying document...</p>
        </div>
      )}

      {(flowStatus === 'error' || flowStatus === 'complete') &&
        scanResponse && (
          <VerificationResult
            scanResponse={scanResponse}
            businessName={businessName}
          />
        )}

      {flowStatus === 'error' && error && !scanResponse && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {flowStatus === 'otp' && (
        <div className="space-y-6">
          {scanResponse && (
            <VerificationResult
              scanResponse={scanResponse}
              businessName={businessName}
            />
          )}

          <div className="border-t pt-6">
            <h3 className="font-semibold text-center mb-4">
              Enter OTP sent to your phone
            </h3>
            <OtpInput
              length={6}
              onComplete={handleOtpComplete}
              disabled={otpMutation.isPending}
              error={error}
            />
            {otpMutation.isPending && (
              <p className="text-center text-gray-500 text-sm mt-2">
                Verifying OTP...
              </p>
            )}
          </div>
        </div>
      )}

      {flowStatus === 'complete' && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Verify Another Document
          </button>
        </div>
      )}

      {(flowStatus === 'error' || (flowStatus === 'complete' && !scanResponse)) && (
        <div className="mt-6">
          <button
            type="button"
            onClick={handleReset}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}


import type { QrScanResponse } from '../types';

interface VerificationResultProps {
  scanResponse: QrScanResponse;
  businessName?: string | null;
}

export default function VerificationResult({
  scanResponse,
  businessName,
}: VerificationResultProps) {
  const isVerified = scanResponse.status === 'VERIFIED';
  const isOtpPending = scanResponse.status === 'OTP_PENDING';
  const isFailed = scanResponse.status === 'FAILED';

  return (
    <div className="space-y-4">
      {isVerified && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">&#10004;</div>
          <h3 className="text-xl font-bold text-green-800">
            Document Verified
          </h3>
          {businessName && (
            <p className="text-green-700 mt-2">{businessName}</p>
          )}
        </div>
      )}

      {isOtpPending && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">&#9432;</div>
          <h3 className="text-xl font-bold text-blue-800">
            Government Verified
          </h3>
          {businessName && (
            <p className="text-blue-700 mt-2">{businessName}</p>
          )}
          <p className="text-blue-600 mt-2 text-sm">
            An OTP has been sent to the registered phone number
          </p>
        </div>
      )}

      {isFailed && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-2">&#10008;</div>
          <h3 className="text-xl font-bold text-red-800">
            Verification Failed
          </h3>
          <p className="text-red-700 mt-2">
            {scanResponse.failureReason || 'Unknown error'}
          </p>
        </div>
      )}

      {scanResponse.extractedData && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-700 mb-2">
            Extracted Document Info
          </h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-500">License No:</dt>
              <dd className="font-mono">
                {scanResponse.extractedData.licenseNo}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">TIN:</dt>
              <dd className="font-mono">{scanResponse.extractedData.tin}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-500">Source:</dt>
              <dd>{scanResponse.extractedData.source}</dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

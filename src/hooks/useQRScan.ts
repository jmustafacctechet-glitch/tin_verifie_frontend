import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { QrScanResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || '';

async function scanQrCode(qrData: string): Promise<QrScanResponse> {
  const response = await axios.post<{ status: string; data: QrScanResponse }>(
    `${API_URL}/api/qr-verification/scan`,
    { qrData },
  );

  if (response.data.status !== 'success') {
    throw new Error('Scan request failed');
  }

  return response.data.data;
}

export function useQRScan() {
  return useMutation({
    mutationFn: scanQrCode,
  });
}

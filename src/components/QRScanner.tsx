import { useRef, useState, useCallback, useEffect } from 'react';

interface QRScannerProps {
  onScan: (qrData: string) => void;
  disabled?: boolean;
}

export default function QRScanner({ onScan, disabled }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
                       
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      setStream(mediaStream);
      setCameraActive(true);
    } catch {
      setError('Camera access denied. Use file upload instead.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraActive(false);
  }, [stream]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);

      try {
        const imageBitmap = await createImageBitmap(file);
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(imageBitmap, 0, 0);
        imageBitmap.close();

        const { default: jsQR } = await import('jsqr');
        const imageData = ctx.getImageData(
          0,
          0,
          canvas.width,
          canvas.height,
        );
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code?.data) {
          onScan(code.data);
        } else {
          setError('No QR code found in the image');
        }
      } catch {
        setError('Failed to decode QR image');
      }
    },
    [onScan],
  );

  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    import('jsqr').then((jsQR) => {
      const code = jsQR.default(
        imageData.data,
        imageData.width,
        imageData.height,
      );

      if (code?.data) {
        stopCamera();
        onScan(code.data);
      }
    });
  }, [onScan, stopCamera]);

  useEffect(() => {
    if (!cameraActive) return;

    const interval = setInterval(captureFrame, 500);
    return () => clearInterval(interval);
  }, [cameraActive, captureFrame]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {!cameraActive ? (
          <button
            type="button"
            onClick={startCamera}
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Open Camera
          </button>
        ) : (
          <button
            type="button"
            onClick={stopCamera}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Stop Camera
          </button>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
        >
          Upload QR Image
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {cameraActive && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-w-md rounded-lg border border-gray-300 object-cover"
        />
      )}

      <canvas ref={canvasRef} className="hidden" />

      {error && (
        <p className="text-red-600 text-sm">{error}</p>
      )}
    </div>
  );
}

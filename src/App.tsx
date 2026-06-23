import VerificationFlow from './components/VerificationFlow';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Ethiopian TIN & Business License Verification
          </h1>
          <p className="text-gray-500 mt-2">
            Scan the QR code on any Ethiopian business license to verify its
            authenticity
          </p>
        </div>

        <VerificationFlow />

        <footer className="mt-12 text-center text-xs text-gray-400">
          <p>Data retrieved from Ethiopian government databases</p>
          <p className="mt-1">
            This is a verification tool — always cross-reference with official
            sources
          </p>
        </footer>
      </div>
    </div>
  );
}

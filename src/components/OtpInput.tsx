import { useState, useRef, type KeyboardEvent } from 'react';

interface OtpInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  disabled?: boolean;
  error?: string | null;
}

export default function OtpInput({
  length = 6,
  onComplete,
  disabled,
  error,
}: OtpInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newDigits.every((d) => d !== '')) {
      onComplete(newDigits.join(''));
    }
  }

  function handleKeyDown(
    index: number,
    e: KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newDigits = [...digits];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setDigits(newDigits);

    if (pasted.length === length) {
      onComplete(pasted);
    } else {
      inputRefs.current[Math.min(pasted.length, length - 1)]?.focus();
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2 justify-center">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className="w-12 h-14 text-center text-xl font-bold border-2 rounded-lg 
                       focus:border-blue-500 focus:outline-none disabled:opacity-50
                       data-[error=true]:border-red-500"
            data-error={!!error}
            maxLength={1}
          />
        ))}
      </div>
      {error && <p className="text-red-600 text-sm text-center">{error}</p>}
    </div>
  );
}

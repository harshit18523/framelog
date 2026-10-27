import React, { useEffect, useRef } from 'react';

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  invalid?: boolean;
  disabled?: boolean;
};

export function OtpInput({ value, onChange, length = 6, invalid, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first empty box or box 0
    const firstEmpty = Math.max(0, Math.min(value.length, length - 1));
    refs.current[firstEmpty]?.focus();
  }, [length, value.length]);

  const focus = (index: number) => {
    const target = Math.max(0, Math.min(length - 1, index));
    refs.current[target]?.focus();
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    if (!digit) return;
    const next = (value.slice(0, index) + digit + value.slice(index + 1)).slice(0, length);
    onChange(next);
    focus(index + 1);
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      if (value[index]) {
        // Clear current digit
        onChange(value.slice(0, index) + value.slice(index + 1));
      } else if (index > 0) {
        // Clear previous digit and move cursor back
        onChange(value.slice(0, index - 1) + value.slice(index));
        focus(index - 1);
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focus(index - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      focus(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!digits) return;
    onChange(digits);
    focus(digits.length);
  };

  return (
    <div className="flex gap-2 sm:gap-2.5" role="group" aria-label="Verification code">
      {Array.from({ length }, (_, i) => {
        const filled = Boolean(value[i]);
        return (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            value={value[i] ?? ''}
            disabled={disabled}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Digit ${i + 1}`}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className={`h-12 w-full min-w-0 rounded-xl bg-white/[0.04] text-center text-lg font-semibold tabular-nums text-fg ring-1 ring-inset transition-[box-shadow,background-color] duration-150 focus:bg-white/[0.07] focus:outline-none disabled:opacity-50 ${
              invalid
                ? 'ring-red-400/60'
                : filled
                ? 'ring-gold/50 focus:ring-gold'
                : 'ring-line-strong focus:ring-gold/60'
            }`}
          />
        );
      })}
    </div>
  );
}

export default OtpInput;

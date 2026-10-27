import React, { useRef, useState } from 'react';
import { CameraIcon } from 'lucide-react';

type AvatarEditorProps = {
  user: {
    name?: string;
    initials?: string;
    tone?: string;
  };
  photo?: string;
  onChange: (photo: string | undefined) => void;
};

const MAX_BYTES = 5 * 1024 * 1024;

export function AvatarEditor({ user, photo, onChange }: AvatarEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file (JPG, PNG or WebP).');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('That image is over 5 MB. Try a smaller one.');
      return;
    }
    setError(undefined);
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  };

  const initials = user.initials || (user.name ? user.name.slice(0, 2).toUpperCase() : 'FL');
  const tone = user.tone || '#4A3418';

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div
          className="rounded-full p-[3px] shadow-[0_18px_50px_-18px_rgba(245,166,35,0.55)]"
          style={{ background: 'conic-gradient(from 210deg, #F5A623, #FCE3A8, #C98512, #7A4E0B, #F5A623)' }}
        >
          <div className="rounded-full bg-surface-raised p-[4px]">
            <div
              style={{ backgroundColor: tone }}
              className="relative grid h-[108px] w-[108px] place-items-center overflow-hidden rounded-full text-3xl font-semibold text-fg"
            >
              {photo ? (
                <img
                  src={photo}
                  alt="Your profile photo"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Upload a new profile photo"
          className="absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full bg-gold text-gold-ink shadow-poster ring-4 ring-surface-raised transition-[transform,background-color] duration-150 ease-cinema hover:scale-105 hover:bg-gold-soft active:scale-95"
        >
          <CameraIcon size={16} strokeWidth={2.25} />
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="sr-only"
          tabIndex={-1}
        />
      </div>

      <div className="mt-4 flex items-center gap-1 text-[13px]">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full px-3 py-1.5 font-medium text-fg transition-colors hover:bg-white/[0.06]"
        >
          Change photo
        </button>
        {photo && (
          <>
            <span className="h-3 w-px bg-line-strong" aria-hidden />
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="rounded-full px-3 py-1.5 text-fg-subtle transition-colors hover:bg-white/[0.06] hover:text-fg"
            >
              Remove
            </button>
          </>
        )}
      </div>
      {error && <p className="mt-1 text-[13px] text-red-300">{error}</p>}
    </div>
  );
}

export default AvatarEditor;

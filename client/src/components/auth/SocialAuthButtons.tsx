import React, { useState } from 'react';
import { LoaderCircleIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Provider = 'apple' | 'google';

export function SocialAuthButtons() {
  const navigate = useNavigate();
  const [pending, setPending] = useState<Provider | null>(null);

  const handle = (provider: Provider) => {
    setPending(provider);
    window.setTimeout(() => navigate('/app'), 900);
  };

  const providers: {id: Provider;label: string;icon: React.ReactNode;}[] = [
  {
    id: 'apple',
    label: 'Apple',
    icon:
    <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden>
          <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.63-2.323-7.28 0-4.28 2.797-6.55 5.552-6.55 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z" />
        </svg>

  },
  {
    id: 'google',
    label: 'Google',
    icon:
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden>
          <path d="M12 10.2v3.9h5.5c-.24 1.4-1.66 4.1-5.5 4.1-3.31 0-6.01-2.74-6.01-6.2s2.7-6.2 6.01-6.2c1.88 0 3.14.8 3.86 1.49l2.63-2.53C16.8 3.2 14.63 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.66 0 9.41-3.98 9.41-9.58 0-.64-.07-1.13-.16-1.62H12z" />
        </svg>

  }];


  return (
    <div className="grid grid-cols-2 gap-3">
      {providers.map((p) =>
      <button
        key={p.id}
        type="button"
        disabled={pending !== null}
        onClick={() => handle(p.id)}
        className="inline-flex h-12 items-center justify-center gap-2.5 rounded-xl bg-white/[0.04] text-sm font-medium text-fg ring-1 ring-inset ring-line-strong transition-[background-color,transform] duration-150 ease-cinema hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-gold/60">
        
          {pending === p.id ? <LoaderCircleIcon size={17} className="animate-spin" /> : p.icon}
          {p.label}
        </button>
      )}
    </div>);

}
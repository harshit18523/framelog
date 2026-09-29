import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { getFilm } from '../utils/films';

type Errors = {name?: string;username?: string;email?: string;password?: string;};

const strengthLabels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

function passwordStrength(value: string): number {
  if (value.length < 8) return 0;
  let score = 1;
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score++;
  if (/\d/.test(value)) score++;
  if (/[^A-Za-z0-9]/.test(value) || value.length >= 14) score++;
  return score;
}

export function Register() {
  const navigate = useNavigate();
  const film = getFilm('the-quiet-hours');
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(form.password);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
  setForm((prev) => ({ ...prev, [key]: key === 'username' ? e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') : e.target.value }));

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!form.name.trim()) next.name = 'Tell us what to call you.';
    if (form.username.length < 3) next.username = 'Usernames need at least 3 characters.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (strength === 0) next.password = 'Use at least 8 characters.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    window.setTimeout(() => navigate('/app'), 1000);
  };

  if (!film) return null;

  return (
    <AuthLayout
      title="Start your film diary"
      subtitle="Free forever. Takes about thirty seconds."
      film={film}
      quote="I have never felt so seen by a film about someone who is almost never seen."
      quoteAuthor="Hana M. — 312 likes"
      footer={
      <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-fg hover:text-gold-soft">
            Sign in
          </Link>
        </>
      }>
      
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField label="Name" autoComplete="name" placeholder="Maya Lindqvist" value={form.name} onChange={set('name')} error={errors.name} />
        <TextField
          label="Username"
          autoComplete="username"
          prefix="framelog.com/"
          placeholder="maya"
          value={form.username}
          onChange={set('username')}
          error={errors.username} />
        
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set('email')}
          error={errors.email} />
        
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          trailing={
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="grid h-9 w-9 place-items-center rounded-lg text-fg-subtle transition-colors hover:text-fg">
            
              {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
            </button>
          }
          hint={
          form.password ?
          <div className="flex items-center gap-3" aria-live="polite">
                <div className="flex flex-1 gap-1.5">
                  {[1, 2, 3, 4].map((i) =>
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i <= strength ? 'bg-gold' : 'bg-white/10'}`} />

              )}
                </div>
                <span className="w-16 text-right text-xs">{strengthLabels[strength]}</span>
              </div> :
          undefined
          } />
        
        <Button type="submit" size="lg" disabled={loading} className="!mt-8 w-full rounded-xl">
          {loading ? <LoaderCircleIcon size={18} className="animate-spin" /> : 'Create account'}
        </Button>
        <p className="text-center text-xs leading-relaxed text-fg-faint">
          By continuing you agree to our{' '}
          <a href="#" className="underline underline-offset-2 hover:text-fg-muted">Terms</a> and{' '}
          <a href="#" className="underline underline-offset-2 hover:text-fg-muted">Privacy Policy</a>.
        </p>
      </form>
    </AuthLayout>);

}
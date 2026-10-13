import React, { useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon, LoaderCircleIcon, AlertCircleIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useAuth } from '../contexts/AuthContext';

type Errors = {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
};

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
  const { register, isAuthenticated } = useAuth();

  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const strength = passwordStrength(form.password);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/app', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = key === 'username' ? e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') : e.target.value;
    setForm((prev) => ({ ...prev, [key]: val }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError('');

    const next: Errors = {};
    if (!form.name.trim()) next.name = 'Tell us what to call you.';
    if (form.username.length < 3) next.username = 'Usernames need at least 3 characters.';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email address.';
    if (strength === 0) next.password = 'Use at least 8 characters.';

    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success('Account created! Welcome to FrameLog.');
      navigate('/app', { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Registration failed. Please check your details.';
      setServerError(message);
      toast.error(message);

      if (message.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: message }));
      } else if (message.toLowerCase().includes('username')) {
        setErrors((prev) => ({ ...prev, username: message }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Start your film diary"
      subtitle="Free forever. Takes about thirty seconds."
      quote="Cinema is a mirror that can become a hammer."
      quoteAuthor="Jean-Luc Godard"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-fg hover:text-gold-soft transition-colors">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {serverError && (
          <div className="flex items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
            <AlertCircleIcon size={16} className="shrink-0 text-rose-400" />
            <span>{serverError}</span>
          </div>
        )}

        <TextField
          label="Name"
          autoComplete="name"
          placeholder="Maya Lindqvist"
          value={form.name}
          onChange={set('name')}
          error={errors.name}
        />

        <TextField
          label="Username"
          autoComplete="username"
          prefix="framelog.com/"
          placeholder="maya"
          value={form.username}
          onChange={set('username')}
          error={errors.username}
        />

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />

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
              className="grid h-9 w-9 place-items-center rounded-lg text-fg-subtle transition-colors hover:text-fg"
            >
              {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
            </button>
          }
          hint={
            form.password ? (
              <div className="flex items-center gap-3" aria-live="polite">
                <div className="flex flex-1 gap-1.5">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                        i <= strength ? 'bg-gold' : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <span className="w-16 text-right text-xs text-fg-subtle">{strengthLabels[strength]}</span>
              </div>
            ) : undefined
          }
        />

        <Button type="submit" size="lg" disabled={loading} className="!mt-8 w-full rounded-xl">
          {loading ? <LoaderCircleIcon size={18} className="animate-spin" /> : 'Create account'}
        </Button>

        <p className="text-center text-xs leading-relaxed text-fg-faint">
          By continuing you agree to our{' '}
          <a href="#" className="underline underline-offset-2 hover:text-fg-muted">
            Terms
          </a>{' '}
          and{' '}
          <a href="#" className="underline underline-offset-2 hover:text-fg-muted">
            Privacy Policy
          </a>
          .
        </p>
      </form>
    </AuthLayout>
  );
}

export default Register;

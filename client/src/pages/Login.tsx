import React, { useEffect, useState } from 'react';
import { EyeIcon, EyeOffIcon, LoaderCircleIcon, AlertCircleIcon } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { useAuth } from '../contexts/AuthContext';

type Errors = {
  email?: string;
  password?: string;
};

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to /app (or intended destination)
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/app';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError('');

    const next: Errors = {};
    if (!email.trim()) {
      next.email = 'Enter your email address.';
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      next.email = 'Enter a valid email address.';
    }

    if (!password) {
      next.password = 'Enter your password.';
    }

    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      toast.success('Welcome back to FrameLog!');
      const from = (location.state as any)?.from?.pathname || '/app';
      navigate(from, { replace: true });
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.message || 'Invalid email or password. Please try again.';
      setServerError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where the credits left off."
      quote="A film is never really good unless the camera is an eye in the head of a poet."
      quoteAuthor="Orson Welles"
      footer={
        <>
          New to FrameLog?{' '}
          <Link to="/register" className="font-medium text-fg hover:text-gold-soft transition-colors">
            Create an account
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
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            if (serverError) setServerError('');
          }}
          error={errors.email}
        />

        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
            if (serverError) setServerError('');
          }}
          error={errors.password}
          labelAction={
            <a href="#" className="text-[13px] text-fg-subtle transition-colors hover:text-fg">
              Forgot password?
            </a>
          }
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
        />

        <Button type="submit" size="lg" disabled={loading} className="!mt-8 w-full rounded-xl">
          {loading ? <LoaderCircleIcon size={18} className="animate-spin" /> : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}

export default Login;

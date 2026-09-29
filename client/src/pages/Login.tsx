import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon, LoaderCircleIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Button } from '../components/ui/Button';
import { TextField } from '../components/ui/TextField';
import { getFilm } from '../utils/films';

type Errors = {email?: string;password?: string;};

export function Login() {
  const navigate = useNavigate();
  const film = getFilm('the-long-field');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const next: Errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Enter a valid email address.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length) return;
    setLoading(true);
    window.setTimeout(() => navigate('/app'), 900);
  };

  if (!film) return null;

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to pick up where the credits left off."
      film={film}
      quote="A western with the patience of a prayer. I walked out and just stood on the pavement for a while."
      quoteAuthor="Maya L. — logged Aug 29"
      footer={
      <>
          New to FrameLog?{' '}
          <Link to="/register" className="font-medium text-fg hover:text-gold-soft">
            Create an account
          </Link>
        </>
      }>
      
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email} />
        
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
            className="grid h-9 w-9 place-items-center rounded-lg text-fg-subtle transition-colors hover:text-fg">
            
              {showPassword ? <EyeOffIcon size={17} /> : <EyeIcon size={17} />}
            </button>
          } />
        
        <Button type="submit" size="lg" disabled={loading} className="!mt-8 w-full rounded-xl">
          {loading ? <LoaderCircleIcon size={18} className="animate-spin" /> : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>);

}
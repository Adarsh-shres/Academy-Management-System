import React, { useState, useEffect } from 'react';
import { BookOpen, CalendarCheck, Eye, EyeOff, GraduationCap, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTE_MAP } from '../lib/routes';

const audienceCards = [
  {
    title: 'For Students',
    description: 'Track courses, assignments, and attendance.',
    icon: GraduationCap,
  },
  {
    title: 'For Teachers',
    description: 'Manage classes, content, and submissions.',
    icon: BookOpen,
  },
  {
    title: 'For Admins',
    description: 'Keep profiles and academic records organized.',
    icon: Users,
  },
  {
    title: 'For Schedules',
    description: 'Stay aligned with classes and key dates.',
    icon: CalendarCheck,
  },
];

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  /* Redirect to appropriate dashboard if already logged in */
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const target = ROLE_ROUTE_MAP[user.role] ?? '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await login(email, password);

    if (!result.success) {
      setError(result.error ?? 'Login failed. Please try again.');
      setIsSubmitting(false);
      return;
    }

    // Login succeeded and profile was fetched - redirect by role
    if (result.user) {
      const target = ROLE_ROUTE_MAP[result.user.role] ?? '/dashboard';
      navigate(target, { replace: true });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      <aside className="relative hidden min-h-screen overflow-hidden bg-brand-blue px-10 py-8 text-white lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_24%_18%,rgba(255,255,255,0.18),transparent_34%),radial-gradient(circle_at_78%_72%,rgba(255,255,255,0.12),transparent_32%)]" />
        <div className="relative z-10 flex items-center gap-3">
          <img src="/image - Edited.png" alt="" className="h-12 w-12 rounded-md bg-white/95 p-2" />
          <div>
            <p className="text-lg font-bold">Academic</p>
            <p className="text-xs font-medium text-white/75">Management System</p>
          </div>
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col justify-center">
          <div className="mb-9 flex justify-center">
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-white/12 shadow-2xl ring-1 ring-white/20">
              <div className="absolute -right-5 top-8 h-12 w-12 rounded-md bg-white/20" />
              <div className="absolute -left-6 bottom-10 h-10 w-10 rounded-full bg-white/15" />
              <img src="/image - Edited.png" alt="" className="relative h-32 w-32 object-contain brightness-0 invert" />
            </div>
          </div>

          <h1 className="max-w-lg text-4xl font-bold leading-tight">
            Manage the academic lifecycle from one focused workspace.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/78">
            Sign in to access role-based dashboards for students, teachers, schedules, courses, and daily academic work.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {audienceCards.map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-md bg-white px-4 py-4 text-brand-blue shadow-lg shadow-black/10">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-brand-blue/10">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <h2 className="text-sm font-bold">{title}</h2>
                <p className="mt-2 text-xs leading-5 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs font-medium text-white/70">Nepal&apos;s modern educational backbone.</p>
      </aside>

      <main className="flex min-h-screen flex-col bg-white px-6 py-6 sm:px-10 lg:px-16">
        <div className="flex justify-end text-right text-sm">
          <p className="text-neutral-500">
            Need an account?{' '}
            <span className="font-medium text-brand-blue">Contact your administrator</span>
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="mb-10 lg:hidden">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-md bg-brand-blue/10">
              <img src="/image - Edited.png" alt="" className="h-10 w-10 object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-950">Academic Management System</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600">
              Sign in to access your academic dashboard.
            </p>
          </div>

          <h2 className="text-2xl font-semibold text-neutral-950">Sign in to your account</h2>
          <p className="mt-3 text-sm text-neutral-500">Use your school email and password to continue.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="sr-only">
                School Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="School email"
                className="w-full rounded-md border border-neutral-200 px-4 py-3 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full rounded-md border border-neutral-200 px-4 py-3 pr-12 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-neutral-400 transition hover:text-brand-blue focus:outline-none focus:text-brand-blue"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center">
                <input
                  id="remember_me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-neutral-300 text-brand-blue focus:ring-brand-blue"
                />
                <label htmlFor="remember_me" className="ml-3 block text-sm text-neutral-600">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-medium text-brand-blue hover:text-primary">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-md bg-brand-blue px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand-blue/20 transition hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 flex items-center gap-4 text-xs text-neutral-400">
            <div className="h-px flex-1 bg-neutral-200" />
            <span>Secure school access</span>
            <div className="h-px flex-1 bg-neutral-200" />
          </div>

          <p className="mt-8 text-center text-xs text-neutral-500">
            For technical support, contact the system administrator.
          </p>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;

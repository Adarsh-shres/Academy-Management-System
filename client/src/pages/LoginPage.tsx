import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTE_MAP } from '../lib/routes';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, login } = useAuth();

  /* Redirect to appropriate dashboard if already logged in */
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const target = ROLE_ROUTE_MAP[user.role] ?? '/dashboard';
      navigate(target, { replace: true });
    }
  }, [isLoading, isAuthenticated, user, navigate]);

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
    <div className="min-h-screen bg-[#F8FAFC] text-[#232529] lg:grid lg:grid-cols-[minmax(360px,0.9fr)_1fr]">
      <aside className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#2331C8] px-10 py-9 text-white lg:flex">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-[6px] bg-white">
              <img src="/image - Edited.png" alt="" className="h-8 w-8 object-contain" />
            </span>
            <div>
              <p className="text-[19px] font-semibold leading-tight">Academic</p>
              <p className="text-[13px] font-medium text-white/78">Management System</p>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[520px]">
          <div className="relative mb-10 flex h-[270px] items-center justify-center">
            <span data-bubble className="absolute left-5 top-5 h-12 w-12 rounded-full bg-white/14" />
            <span data-bubble className="absolute right-16 top-4 h-8 w-8 rounded-full bg-white/18" />
            <span data-bubble className="absolute right-4 top-24 h-16 w-16 rounded-full bg-white/10" />
            <span data-bubble className="absolute bottom-12 left-12 h-7 w-7 rounded-full bg-white/16" />
            <span data-bubble className="absolute bottom-4 right-28 h-10 w-10 rounded-full bg-white/12" />
            <span data-bubble className="absolute left-24 top-28 h-5 w-5 rounded-full bg-white/20" />

            <div className="relative flex h-52 w-52 items-center justify-center rounded-full bg-white shadow-[0_24px_75px_rgba(10,18,84,0.26)] ring-1 ring-white/40">
              <img
                src="/image - Edited.png"
                alt=""
                className="h-24 w-24 object-contain"
                style={{ filter: 'sepia(1) saturate(4) hue-rotate(190deg)' }}
              />
            </div>
            <img
              src="/studying.png"
              alt=""
              className="pointer-events-none absolute right-0 top-4 h-36 w-44 object-cover object-right-bottom drop-shadow-[0_20px_34px_rgba(10,18,84,0.26)]"
            />
            <img
              src="/graduate-character.svg"
              alt=""
              className="pointer-events-none absolute bottom-3 left-2 h-32 w-32 object-contain drop-shadow-[0_20px_34px_rgba(10,18,84,0.26)]"
            />
          </div>

          <h1 className="max-w-[480px] text-[38px] font-semibold leading-[1.18] tracking-tight">
            Manage the academic lifecycle from one focused workspace.
          </h1>
          <p className="mt-5 max-w-[470px] text-[15px] leading-7 text-white/78">
            Access your role-based dashboard for classes, schedules, courses, and daily academic work.
          </p>
        </div>
        <p className="text-[12px] font-medium text-white/58">Secure academic access</p>
      </aside>

      <main className="flex min-h-screen flex-col bg-[#F8FAFC] px-6 py-7 sm:px-10 lg:px-16">
        <div className="flex justify-center text-center text-sm text-[#667086] sm:justify-end sm:text-right">
          <p>
            Need an account? <span className="font-medium text-[#232529]">Contact your administrator</span>
          </p>
        </div>

        <section className="mx-auto flex w-full max-w-[455px] flex-1 flex-col justify-center py-12">
          <div className="mb-8 lg:hidden">
            <img src="/image - Edited.png" alt="" className="mb-5 h-12 w-12 object-contain" />
            <h1 className="text-[24px] font-semibold tracking-tight text-[#232529]">Academic Management System</h1>
          </div>

          <h2 className="text-[26px] font-semibold tracking-tight text-black">Sign in to your account</h2>
          <p className="mt-3 text-sm leading-6 text-[#667086]">Use your school email and password to continue.</p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            {error && (
              <div className="rounded-[6px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
                className="w-full rounded-[6px] border border-[#E1E6EE] bg-white px-4 py-3.5 text-sm text-[#232529] outline-none transition placeholder:text-[#9aa6bf] focus:border-[#CCD4E0] focus:ring-2 focus:ring-[#E1E6EE]"
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
                  className="w-full rounded-[6px] border border-[#E1E6EE] bg-white px-4 py-3.5 pr-12 text-sm text-[#232529] outline-none transition placeholder:text-[#9aa6bf] focus:border-[#CCD4E0] focus:ring-2 focus:ring-[#E1E6EE]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#9aa6bf] transition hover:text-[#4B5563] focus:outline-none focus:text-[#4B5563]"
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
                  className="h-4 w-4 rounded border-[#E1E6EE] text-[#4B5563] focus:ring-[#CCD4E0]"
                />
                <label htmlFor="remember_me" className="ml-3 block text-sm text-[#667086]">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-medium text-[#4B5563] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-3 w-full rounded-[6px] bg-[#3E4FFF] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(62,79,255,0.26)] transition hover:bg-[#5F73F5] focus:outline-none focus:ring-2 focus:ring-[#CCD4E0] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 flex items-center gap-4 text-xs text-[#9aa6bf]">
            <div className="h-px flex-1 bg-[#E1E6EE]" />
            <span>Secure school access</span>
            <div className="h-px flex-1 bg-[#E1E6EE]" />
          </div>
        </section>
      </main>
    </div>
  );
};

export default LoginPage;

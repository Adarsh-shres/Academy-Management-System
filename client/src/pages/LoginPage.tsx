import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTE_MAP } from '../lib/routes';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    // Login succeeded and profile was fetched — redirect by role
    if (result.user) {
      const target = ROLE_ROUTE_MAP[result.user.role] ?? '/dashboard';
      navigate(target, { replace: true });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      {/* Login card wrapper */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-5xl flex">
        {/* Left branding section, visible on medium and larger screens */}
        <div className="hidden md:flex w-1/2 bg-brand-blue flex-col items-center justify-center p-12 text-white">
          <h1 className="text-4xl font-bold mb-3">Academic</h1>
          <h2 className="text-xl font-medium tracking-wide">Management System</h2>
          <p className="mt-8 text-sm text-neutral-200 text-center">Nepal&apos;s modern educational backbone.</p>
        </div>

        {/* Login form section */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <h3 className="text-3xl font-semibold text-neutral-900 mb-2">Welcome Back</h3>
          <p className="text-neutral-600 mb-10">Sign in to manage the academic lifecycle.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Displays login error messages returned from authentication */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Email input field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                School Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@school.edu"
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition"
              />
            </div>

            {/* Password input field with forgot password navigation */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-brand-blue hover:text-blue-700">
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="........"
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition"
              />
            </div>

            {/* Remember me option for the login form */}
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 text-brand-blue border-neutral-300 rounded focus:ring-brand-blue"
              />
              <label htmlFor="remember_me" className="ml-3 block text-sm text-neutral-700">
                Remember me
              </label>
            </div>

            {/* Login submit button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-brand-blue text-white font-semibold rounded-none shadow-md hover:bg-primary transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Signing In...' : 'Sign In to Dashboard'}
              </button>
            </div>
          </form>

          <p className="mt-12 text-center text-xs text-neutral-500">
            For technical support, contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

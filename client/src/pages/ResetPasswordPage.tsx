import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRecoveryReady, setIsRecoveryReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkRecoverySession = async () => {
      const { data } = await supabase.auth.getSession();
      if (isMounted && data.session) {
        setIsRecoveryReady(true);
      }
    };

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) {
        setIsRecoveryReady(true);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password updated successfully. Redirecting to login...');
      window.setTimeout(() => {
        navigate('/login');
      }, 1500);
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-5xl flex">
        <div className="hidden md:flex w-1/2 bg-brand-blue flex-col items-center justify-center p-12 text-white">
          <h1 className="text-4xl font-bold mb-3">Choose a New Password</h1>
          <h2 className="text-xl font-medium tracking-wide">Academic Management System</h2>
          <p className="mt-8 text-sm text-neutral-200 text-center">
            Set a strong password to secure your account before signing in again.
          </p>
        </div>

        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <h3 className="text-3xl font-semibold text-neutral-900 mb-2">Reset Password</h3>
          <p className="text-neutral-600 mb-10">Enter and confirm your new password below.</p>

          {!isRecoveryReady && (
            <div className="mb-6 p-3 bg-amber-100 border border-amber-300 text-amber-800 rounded-md text-sm">
              Open this page from the reset link sent to your email. A recovery session is required before you can
              save a new password.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded-md text-sm">
                {message}
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter a new password"
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || !isRecoveryReady}
                className="w-full px-6 py-3 bg-brand-blue text-white font-semibold rounded-none shadow-md hover:bg-primary transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>

          <p className="mt-8 text-sm text-neutral-600">
            Want to go back?{' '}
            <Link to="/login" className="font-medium text-brand-blue hover:text-blue-700">
              Return to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

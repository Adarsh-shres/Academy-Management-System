import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsSubmitting(true);

    const redirectTo = `${window.location.origin}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset instructions have been sent to your email address.');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      {/* Forgot password card wrapper */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-5xl flex">
        {/* Left information section, visible on medium and larger screens */}
        <div className="hidden md:flex w-1/2 bg-brand-blue flex-col items-center justify-center p-12 text-white">
          <h1 className="text-4xl font-bold mb-3">Reset Access</h1>
          <h2 className="text-xl font-medium tracking-wide">Academic Management System</h2>
          <p className="mt-8 text-sm text-neutral-200 text-center">
            We will send you a secure link to set a new password.
          </p>
        </div>

        {/* Password reset request form section */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <h3 className="text-3xl font-semibold text-neutral-900 mb-2">Forgot Password</h3>
          <p className="text-neutral-600 mb-10">Enter your school email to receive a password reset link.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Displays errors returned from the password reset request */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Displays confirmation after the reset email is sent */}
            {message && (
              <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-700 rounded-md text-sm">
                {message}
              </div>
            )}

            {/* Email input used to request the password reset link */}
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

            {/* Submit button for sending password reset instructions */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-3 bg-brand-blue text-white font-semibold rounded-none shadow-md hover:bg-primary transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </div>
          </form>

          {/* Navigation link back to the login page */}
          <p className="mt-8 text-sm text-neutral-600">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-brand-blue hover:text-blue-700">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

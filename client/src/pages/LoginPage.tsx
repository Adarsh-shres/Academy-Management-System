import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', { email, password });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      {/* Main card - 2 column layout */}
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-5xl flex">

        {/* Left Column: Branding (Clean Text Version) */}
        <div className="hidden md:flex w-1/2 bg-brand-blue flex-col items-center justify-center p-12 text-white">
          <h1 className="text-4xl font-bold mb-3">Academic</h1>
          <h2 className="text-xl font-medium tracking-wide">Management System</h2>
          <p className="mt-8 text-sm text-neutral-200 text-center">Nepal's modern educational backbone.</p>
        </div>

        {/* Right Column: Form */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <h3 className="text-3xl font-semibold text-neutral-900 mb-2">Welcome Back</h3>
          <p className="text-neutral-600 mb-10">Sign in to manage the academic lifecycle.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
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

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-brand-blue hover:text-blue-700">
                  Forgot?
                </a>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-neutral-300 rounded-md focus:ring-2 focus:ring-brand-blue focus:border-brand-blue outline-none transition"
              />
            </div>

            {/* Remember Me */}
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

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                className="w-full px-6 py-3 bg-brand-blue text-white font-semibold rounded-none shadow-md hover:bg-primary transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Sign In to Dashboard
              </button>
            </div>
          </form>

          {/* Footer */}
          <p className="mt-12 text-center text-xs text-neutral-500">
            For technical support, contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

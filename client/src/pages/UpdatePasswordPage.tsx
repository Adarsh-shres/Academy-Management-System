import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  visible: boolean;
  disabled: boolean;
  autoComplete: string;
  ariaShowLabel: string;
  ariaHideLabel: string;
  onChange: (value: string) => void;
  onToggle: () => void;
}

function PasswordInput({
  id,
  label,
  value,
  placeholder,
  visible,
  disabled,
  autoComplete,
  ariaShowLabel,
  ariaHideLabel,
  onChange,
  onToggle,
}: PasswordInputProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-semibold text-[#232529] mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          required
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full rounded-[8px] border border-[#E1E6EE] bg-white px-3.5 py-3 pr-12 text-[13px] text-[#232529] outline-none transition placeholder:text-[#9aa3b2] focus:border-[#CCD4E0] focus:ring-2 focus:ring-[#CCD4E0]/15"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-[#7c8697] transition hover:text-[#4B5563] focus:outline-none focus:text-[#4B5563] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={visible ? ariaHideLabel : ariaShowLabel}
          aria-pressed={visible}
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

const UpdatePasswordPage: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (currentPassword === newPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (user?.email) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });

        if (signInError) {
          setError('Current password is incorrect.');
          setIsSubmitting(false);
          return;
        }
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage('Password updated successfully. Redirecting to profile...');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        window.setTimeout(() => {
          navigate('/student/profile');
        }, 1500);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password update error:', err);
    }

    setIsSubmitting(false);
  };

  const handleBack = () => {
    navigate('/student/profile');
  };

  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center">
      <div className="w-full max-w-[520px] rounded-[10px] border border-[#E1E6EE] bg-white shadow-[0_18px_50px_rgba(36,37,41,0.10)] overflow-hidden">
        <div className="border-b border-[#E1E6EE] bg-[#F6F8FB] px-7 py-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#5F73F5]">Account Security</p>
          <h1 className="mt-2 text-[24px] font-bold tracking-tight text-[#232529]">Update Password</h1>
          <p className="mt-1 text-[13px] leading-5 text-[#7c8697]">Use a password that is hard to guess and different from your current one.</p>
        </div>

        <div className="p-7">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-[8px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-[13px] font-medium text-[#b91c1c]">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-[8px] border border-[#bbf7d0] bg-[#f0fdf4] px-4 py-3 text-[13px] font-medium text-[#15803d]">
                {message}
              </div>
            )}

            <PasswordInput
              id="current-password"
              label="Current Password"
              value={currentPassword}
              onChange={setCurrentPassword}
              visible={showCurrentPassword}
              onToggle={() => setShowCurrentPassword((current) => !current)}
              placeholder="Enter your current password"
              autoComplete="current-password"
              disabled={isSubmitting}
              ariaShowLabel="Show current password"
              ariaHideLabel="Hide current password"
            />

            <PasswordInput
              id="new-password"
              label="New Password"
              value={newPassword}
              onChange={setNewPassword}
              visible={showNewPassword}
              onToggle={() => setShowNewPassword((current) => !current)}
              placeholder="Enter a new password"
              autoComplete="new-password"
              disabled={isSubmitting}
              ariaShowLabel="Show new password"
              ariaHideLabel="Hide new password"
            />

            <PasswordInput
              id="confirm-password"
              label="Confirm New Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              visible={showConfirmPassword}
              onToggle={() => setShowConfirmPassword((current) => !current)}
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              disabled={isSubmitting}
              ariaShowLabel="Show confirm password"
              ariaHideLabel="Hide confirm password"
            />

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 rounded-[8px] border border-[#E1E6EE] bg-white px-4 py-3 text-[13px] font-semibold uppercase tracking-wide text-[#232529] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-[8px] bg-[#3E4FFF] px-4 py-3 text-[13px] font-semibold uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(62,79,255,0.22)] transition hover:bg-[#5F73F5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>

          <div className="mt-6 rounded-[8px] border border-[#E1E6EE] bg-[#F6F8FB] p-4">
            <p className="text-[12px] font-bold uppercase tracking-wider text-[#4B5563]">Password checklist</p>
            <ul className="mt-3 space-y-2 text-[12px] leading-5 text-[#64748b]">
              <li>- At least 6 characters long</li>
              <li>- Different from your current password</li>
              <li>- Matches the confirmation field</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordPage;

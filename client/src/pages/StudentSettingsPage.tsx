import { useNavigate } from 'react-router-dom';
import AccessibilitySettingsPanel from '../components/shared/AccessibilitySettingsPanel';
import { useAuth } from '../context/AuthContext';

export default function StudentSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-10">
      <div>
        <h1 className="font-sans text-[26px] md:text-[28px] font-bold tracking-tight text-[#4b3f68]">Settings</h1>
        <p className="mt-1 text-[14px] text-[#7c8697]">Manage your account preferences and accessibility settings.</p>
      </div>

      <section className="rounded-[10px] border border-[#e7dff0] bg-white p-8 shadow-[0_2px_12px_rgba(57,31,86,0.02)]">
        <h2 className="font-sans text-[19px] font-bold tracking-tight text-[#4b3f68]">Account</h2>
        <div className="mt-6 space-y-4">
          <div className="border-b border-[#f3eff7] py-3">
            <p className="mb-1 text-[13px] font-semibold uppercase tracking-wider text-[#778196]">Full Name</p>
            <p className="text-[14px] font-medium text-[#4b3f68]">{user?.name || 'N/A'}</p>
          </div>
          <div className="border-b border-[#f3eff7] py-3">
            <p className="mb-1 text-[13px] font-semibold uppercase tracking-wider text-[#778196]">Email Address</p>
            <p className="text-[14px] font-medium text-[#4b3f68]">{user?.email || 'N/A'}</p>
          </div>
          <div className="flex flex-col gap-3 rounded-[8px] border border-[#e7dff0] bg-[#f9f8fa] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[#4b3f68]">Account Password</p>
              <p className="mt-1 text-[12px] font-medium text-[#7c8697]">Change your password regularly to keep your account secure.</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/update-password')}
              className="rounded-[6px] border border-transparent bg-[#f3eff7] px-4 py-2 text-[11.5px] font-semibold uppercase tracking-wider text-primary transition-colors hover:bg-[#e7dff0]"
            >
              Update
            </button>
          </div>
        </div>
      </section>

      <AccessibilitySettingsPanel />
    </div>
  );
}

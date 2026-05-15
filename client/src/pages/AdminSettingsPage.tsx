import AccessibilitySettingsPanel from '../components/shared/AccessibilitySettingsPanel';
import { useAuth } from '../context/AuthContext';

export default function AdminSettingsPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-10">
      <div>
        <h1 className="text-[28px] font-extrabold tracking-tight text-[#0d3349]">Settings</h1>
        <p className="mt-1 text-[14px] text-[#64748b]">Manage your account preferences and accessibility settings.</p>
      </div>

      <section className="rounded-[10px] border border-[#e7dff0] bg-white p-8 shadow-[0_2px_12px_rgba(57,31,86,0.02)]">
        <h2 className="font-sans text-[19px] font-bold tracking-tight text-[#4b3f68]">Profile Information</h2>
        <div className="mt-6 space-y-4">
          <div className="border-b border-[#f3eff7] py-3">
            <p className="mb-1 text-[13px] font-semibold uppercase tracking-wider text-[#778196]">Full Name</p>
            <p className="text-[14px] font-medium text-[#4b3f68]">{user?.name || 'N/A'}</p>
          </div>
          <div className="border-b border-[#f3eff7] py-3">
            <p className="mb-1 text-[13px] font-semibold uppercase tracking-wider text-[#778196]">Email Address</p>
            <p className="text-[14px] font-medium text-[#4b3f68]">{user?.email || 'N/A'}</p>
          </div>
          <div className="py-3">
            <p className="mb-1 text-[13px] font-semibold uppercase tracking-wider text-[#778196]">Role</p>
            <p className="text-[14px] font-medium capitalize text-[#4b3f68]">{user?.role?.replace('_', ' ') || 'N/A'}</p>
          </div>
        </div>
      </section>

      <AccessibilitySettingsPanel />
    </div>
  );
}

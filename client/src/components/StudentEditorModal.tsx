import { useState } from 'react';
import AppModal from './AppModal';
import type { StudentRecord } from '../types/student';

interface StudentEditorModalProps {
  student: StudentRecord;
  onClose: () => void;
  onSave: (student: StudentRecord) => void | Promise<void>;
}

function SectionTitle({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#7b6591]">{eyebrow}</p>
      <h3 className="mt-2 text-[24px] font-extrabold tracking-tight text-[#0d3349]">{title}</h3>
      <p className="mt-1 text-[13px] text-[#64748b]">{description}</p>
    </div>
  );
}

function FieldLabel({ children }: { children: string }) {
  return <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748b]">{children}</label>;
}

function inputClassName() {
  return 'w-full rounded-2xl border border-[#dbe4f0] bg-[#fbfdff] px-4 py-3 text-[14px] text-[#1e293b] outline-none transition-all focus:border-[#6a5182] focus:ring-4 focus:ring-[#6a5182]/10';
}

export default function StudentEditorModal({ student, onClose, onSave }: StudentEditorModalProps) {
  const [draft, setDraft] = useState<StudentRecord>(student);

  const setField = <K extends keyof StudentRecord>(field: K, value: StudentRecord[K]) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppModal onClose={onClose} widthClass="max-w-5xl">
      <div className="overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_32px_80px_rgba(57,31,86,0.18)]">
        <div className="border-b border-[#ece4f4] bg-[linear-gradient(135deg,#f8f4fd_0%,#edf6fb_100%)] px-6 py-6 md:px-8">
          <div className="flex items-start justify-between gap-4">
            <SectionTitle
              eyebrow="Student Editor"
              title={`${draft.firstName || 'Student'} ${draft.lastName || ''}`.trim()}
              description="Update identity, enrollment details, and profile fields in one place."
            />
            <button onClick={onClose} className="rounded-full border border-[#ddd2ea] bg-white p-2 text-[#6a5182] transition-colors hover:bg-[#f4ecfb]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#6a5182] shadow-sm">
              {draft.isActive ? 'Active Student' : 'Inactive Student'}
            </span>
            <span className="rounded-full bg-[#eef6ff] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#006496] shadow-sm">
              {draft.department || 'Department Not Set'}
            </span>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSave(draft);
          }}
          className="max-h-[calc(100vh-180px)] overflow-y-auto px-6 py-6 md:px-8"
        >
          <div className="grid gap-8">
            <section className="grid gap-4">
              <SectionTitle
                eyebrow="Identity"
                title="Personal Basics"
                description="These fields shape how the student appears across the system."
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                <div className="grid gap-2">
                  <FieldLabel>First Name</FieldLabel>
                  <input className={inputClassName()} value={draft.firstName} onChange={(e) => setField('firstName', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <FieldLabel>Last Name</FieldLabel>
                  <input className={inputClassName()} value={draft.lastName} onChange={(e) => setField('lastName', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <FieldLabel>Father&apos;s Name</FieldLabel>
                  <input className={inputClassName()} value={draft.fatherName} onChange={(e) => setField('fatherName', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <FieldLabel>Date Of Birth</FieldLabel>
                  <input type="date" className={inputClassName()} value={draft.dateOfBirth} onChange={(e) => setField('dateOfBirth', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <FieldLabel>Gender</FieldLabel>
                  <select className={inputClassName()} value={draft.gender} onChange={(e) => setField('gender', e.target.value as StudentRecord['gender'])}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  <FieldLabel>City</FieldLabel>
                  <input className={inputClassName()} value={draft.city} onChange={(e) => setField('city', e.target.value)} />
                </div>
              </div>
            </section>

            <section className="grid gap-4">
              <SectionTitle
                eyebrow="Enrollment"
                title="Academic Placement"
                description="Keep department and course placement visible and easy to update."
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="grid gap-2">
                  <FieldLabel>Email</FieldLabel>
                  <input
                    type="email"
                    className={`${inputClassName()} cursor-not-allowed bg-[#f8fafc] text-[#64748b]`}
                    value={draft.email}
                    readOnly
                    title="Student email is managed when the account is created."
                  />
                </div>
                <div className="grid gap-2">
                  <FieldLabel>Mobile No</FieldLabel>
                  <input className={inputClassName()} value={draft.mobileNo} onChange={(e) => setField('mobileNo', e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <FieldLabel>Department</FieldLabel>
                  <input className={inputClassName()} value={draft.department} onChange={(e) => setField('department', e.target.value as StudentRecord['department'])} placeholder="e.g. CSE" />
                </div>
                <div className="grid gap-2">
                  <FieldLabel>Course</FieldLabel>
                  <input className={inputClassName()} value={draft.course} onChange={(e) => setField('course', e.target.value)} placeholder="e.g. B.Tech" />
                </div>
              </div>
            </section>

            <section className="grid gap-4">
              <SectionTitle
                eyebrow="Address"
                title="Location Details"
                description="Useful when student records need human contact information."
              />
              <div className="grid gap-2">
                <FieldLabel>Address</FieldLabel>
                <textarea
                  rows={4}
                  className={`${inputClassName()} resize-none`}
                  value={draft.address}
                  onChange={(e) => setField('address', e.target.value)}
                />
              </div>
            </section>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#ece4f4] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-[#e2d9ed] bg-[#f7f2fb] px-5 py-3 text-[14px] font-bold text-[#6a5182] transition-all hover:bg-[#eadff4]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-[#6a5182] px-6 py-3 text-[14px] font-bold text-white shadow-[0_16px_30px_rgba(106,81,130,0.22)] transition-all hover:bg-[#5b4471]"
            >
              Save Student Changes
            </button>
          </div>
        </form>
      </div>
    </AppModal>
  );
}

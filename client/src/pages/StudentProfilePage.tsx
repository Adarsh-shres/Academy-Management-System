import { useState } from "react";
import { studentProfile } from "../data/studentMockData";

export default function StudentProfilePage() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...studentProfile });

  const fields: { label: string, key: keyof typeof studentProfile, icon: string }[] = [
    { label: "Full Name", key: "name", icon: "👤" },
    { label: "Email Address", key: "email", icon: "✉️" },
    { label: "Roll Number", key: "rollNo", icon: "🪪" },
    { label: "Department", key: "department", icon: "🏛️" },
    { label: "Course", key: "course", icon: "📚" },
    { label: "Semester", key: "semester", icon: "📅" },
    { label: "Batch", key: "batch", icon: "🎓" },
    { label: "Phone", key: "phone", icon: "📱" },
  ];

  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10 flex-1 min-w-0 max-w-[900px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[28px] md:text-[31px] font-extrabold text-[#4b3f68] tracking-tight">
            Student Profile
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">Manage your academic and personal details</p>
        </div>
      </div>

      {/* Profile banner card */}
      <div className="bg-gradient-to-r from-[#6a5182] to-[#8b6ca8] rounded-sm p-[32px] text-white shadow-md relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-[24px] relative z-10">
          <div className="w-[100px] h-[100px] rounded-[16px] bg-[#f5effa] text-primary flex items-center justify-center text-[40px] font-extrabold shadow-[0_8px_24px_rgba(57,31,86,0.15)] flex-shrink-0">
            {studentProfile.avatar}
          </div>
          <div className="text-center md:text-left mt-2 md:mt-1">
            <h2 className="font-sans text-[26px] font-extrabold leading-tight tracking-tight">{form.name}</h2>
            <p className="text-[#efe8f5] text-[15px] font-medium mt-[2px] mb-[12px]">{form.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-[10px] flex-wrap">
              <span className="text-[11.5px] font-extrabold bg-[#412e54]/30 px-[12px] py-[4px] rounded-[6px] uppercase tracking-wide border border-white/10 shadow-inner">{form.rollNo}</span>
              <span className="text-[11.5px] font-extrabold bg-[#412e54]/30 px-[12px] py-[4px] rounded-[6px] uppercase tracking-wide border border-white/10 shadow-inner">{form.semester}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_4px_16px_rgba(57,31,86,0.02)] p-[32px]">
        <div className="flex items-center justify-between mb-[24px] border-b border-[#f3eff7] pb-[18px]">
          <h3 className="font-sans text-[20px] font-extrabold text-[#4b3f68] tracking-tight">Personal Information</h3>
          <button
            onClick={() => {
               if(editing) {
                 setForm({ ...studentProfile });
               }
               setEditing(!editing);
            }}
            className={`flex items-center gap-[8px] text-[12px] font-extrabold px-[16px] py-[8px] rounded-[8px] uppercase tracking-wider transition-all ${
              editing
                ? "bg-[#faf8fc] text-[#778196] hover:bg-[#efe8f5] border border-[#e7dff0]"
                : "bg-primary text-white hover:opacity-90 shadow-sm"
            }`}
          >
            {editing ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Form
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-[32px] gap-y-[20px]">
          {fields.map(({ label, key, icon }) => (
            <div key={key}>
              <label className="text-[11.5px] font-bold text-[#778196] uppercase tracking-[0.08em] block mb-1.5 flex items-center gap-1.5">
                <span className="text-[13px]">{icon}</span> {label}
              </label>
              {editing ? (
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full text-[14px] font-semibold text-[#4b3f68] bg-[#faf8fc] border border-[#e7dff0] rounded-[8px] px-[14px] py-[10px] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-[inset_0_1px_3px_rgba(57,31,86,0.02)]"
                />
              ) : (
                <div className="text-[14px] font-semibold text-[#4b3f68] bg-[#fdfcff] rounded-[8px] px-[14px] py-[10px] border border-transparent">
                  {form[key]}
                </div>
              )}
            </div>
          ))}
        </div>

        {editing && (
          <div className="mt-[32px] pt-[24px] border-t border-[#f3eff7] flex gap-[12px]">
            <button
              onClick={() => setEditing(false)}
              className="py-[12px] px-[24px] rounded-[8px] text-[13px] font-bold uppercase tracking-wider text-white bg-primary hover:opacity-90 transition-opacity"
            >
              Save Details
            </button>
            <button
              onClick={() => { setForm({ ...studentProfile }); setEditing(false); }}
              className="py-[12px] px-[24px] rounded-[8px] text-[13px] font-bold uppercase tracking-wider text-[#778196] bg-[#faf8fc] border border-[#e7dff0] hover:bg-[#efe8f5] transition-colors"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* Security card */}
      <div className="bg-white rounded-sm border border-[#e7dff0] shadow-[0_4px_16px_rgba(57,31,86,0.02)] p-[32px]">
        <h3 className="font-sans text-[20px] font-extrabold text-[#4b3f68] tracking-tight mb-[24px]">Security</h3>
        <div className="flex items-center justify-between pb-[16px] border-b border-[#f3eff7] mb-[16px]">
          <div>
            <p className="text-[14px] font-bold text-[#4b3f68]">Account Password</p>
            <p className="text-[12px] font-medium text-[#7c8697] mt-0.5">Last changed 2 months ago</p>
          </div>
          <button className="text-[11.5px] font-extrabold text-primary bg-[#f3eff7] hover:bg-[#e7dff0] px-[16px] py-[8px] rounded-[6px] uppercase tracking-wider transition-colors border border-transparent">
            Update
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-bold text-[#4b3f68]">Two-Factor Authentication</p>
            <p className="text-[12px] font-medium text-[#7c8697] mt-0.5">Currently disabled</p>
          </div>
          <button className="text-[11.5px] font-extrabold text-[#059669] bg-[#ecfdf5] hover:bg-[#d1fae5] px-[16px] py-[8px] rounded-[6px] uppercase tracking-wider transition-colors border border-[#d1fae5]">
            Enable
          </button>
        </div>
      </div>
    </div>
  );
}

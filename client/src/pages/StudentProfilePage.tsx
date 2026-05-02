import { useStudentData } from "../hooks/useStudentData";
import type { StudentProfileData } from "../hooks/useStudentData";

export default function StudentProfilePage() {
  const { profile: studentProfile, isLoading, error } = useStudentData();

  if (isLoading) {
    return <div className="flex h-[300px] items-center justify-center text-[#7c8697] text-[13px] font-semibold animate-pulse uppercase tracking-wider">Loading Profile...</div>;
  }

  if (error || !studentProfile) {
    return <div className="flex h-[300px] items-center justify-center text-[#4b3f68] font-semibold">{error || "Failed to load profile"}</div>;
  }

  const fields: { label: string, key: keyof StudentProfileData }[] = [
    { label: "Full Name", key: "name" },
    { label: "Email Address", key: "email" },
    { label: "Roll Number", key: "rollNo" },
    { label: "Department", key: "department" },
    { label: "Course", key: "course" },
    { label: "Semester", key: "semester" },
    { label: "Batch", key: "batch" },
    { label: "Phone", key: "phone" },
  ];

  return (
    <div className="flex flex-col gap-7 md:gap-9 pb-10 flex-1 min-w-0 max-w-[900px] mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-sans text-[26px] md:text-[28px] font-bold text-[#4b3f68] tracking-tight">
            Student Profile
          </h1>
          <p className="text-[14px] text-[#7c8697] mt-1">Manage your academic and personal details</p>
        </div>
      </div>

      {/* Profile banner card */}
      <div className="bg-gradient-to-r from-[#6a5182] to-[#8b6ca8] rounded-[10px] p-8 text-white shadow-md relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          <div className="w-[90px] h-[90px] rounded-[14px] bg-[#f5effa] text-primary flex items-center justify-center text-[36px] font-bold shadow-[0_8px_24px_rgba(57,31,86,0.15)] flex-shrink-0">
            {studentProfile.avatar}
          </div>
          <div className="text-center md:text-left mt-2 md:mt-1">
            <h2 className="font-sans text-[24px] font-bold leading-tight tracking-tight">{studentProfile.name}</h2>
            <p className="text-[#efe8f5] text-[14px] font-medium mt-[2px] mb-3">{studentProfile.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
              <span className="text-[11px] font-semibold bg-[#412e54]/30 px-3 py-1 rounded-[6px] uppercase tracking-wide border border-white/10">{studentProfile.rollNo}</span>
              <span className="text-[11px] font-semibold bg-[#412e54]/30 px-3 py-1 rounded-[6px] uppercase tracking-wide border border-white/10">{studentProfile.semester}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.02)] p-8">
        <div className="flex items-center justify-between mb-6 border-b border-[#f3eff7] pb-5">
          <h3 className="font-sans text-[19px] font-bold text-[#4b3f68] tracking-tight">Personal Information</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          {fields.map(({ label, key }) => (
            <div key={key}>
              <label className="text-[11px] font-semibold text-[#778196] uppercase tracking-[0.06em] block mb-1.5">
                {label}
              </label>
              <div className="text-[14px] font-medium text-[#4b3f68] bg-[#fdfcff] rounded-[8px] px-3.5 py-2.5 border border-transparent">
                {studentProfile[key as keyof typeof studentProfile]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security card */}
      <div className="bg-white rounded-[10px] border border-[#e7dff0] shadow-[0_2px_12px_rgba(57,31,86,0.02)] p-8">
        <h3 className="font-sans text-[19px] font-bold text-[#4b3f68] tracking-tight mb-6">Security</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[14px] font-semibold text-[#4b3f68]">Account Password</p>
            <p className="text-[12px] font-medium text-[#7c8697] mt-0.5">Last changed 2 months ago</p>
          </div>
          <button className="text-[11.5px] font-semibold text-primary bg-[#f3eff7] hover:bg-[#e7dff0] px-4 py-2 rounded-[6px] uppercase tracking-wider transition-colors border border-transparent">
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

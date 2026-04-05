import React, { useState, useEffect } from "react";
import { type User, ROLES, DEPARTMENTS, COURSES } from "../../data/mockUsers.ts";

export interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (user: any) => void;
  editingUser: User | null;
}

const EMPTY_FORM = {
  name: "",
  email: "",
  role: ROLES.STUDENT,
  department: "",
  course: "",
  phone: "",
  status: "Active",
};

export default function UserModal({ isOpen, onClose, onSubmit, editingUser }: UserModalProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingUser) {
      setForm({ ...editingUser });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [editingUser, isOpen]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Invalid email format";
    if (!form.department) newErrors.department = "Department is required";
    if (!form.course) newErrors.course = "Course is required";
    return newErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(form);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-[23.74px] shadow-2xl w-full max-w-lg z-10 overflow-hidden border border-[#e2e8f0]">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-[#0d3349] font-extrabold text-[20px] tracking-tight">
              {editingUser ? "Update User Profile" : "Register New User"}
            </h2>
            <p className="text-[#64748b] text-[12.5px] font-medium mt-0.5">
              {editingUser
                ? "Modify roles and departmental assignments"
                : "Enter credentials and assign institutional roles"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-[#0d3349] transition-colors p-2 rounded-xl hover:bg-slate-100"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Role Toggle */}
        <div className="px-6 pt-6">
          <label className="block text-[11px] font-bold text-[#64748b] uppercase tracking-widest mb-3">
            Institutional Role
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-50 rounded-xl border border-slate-100">
            {Object.values(ROLES).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm((p) => ({ ...p, role }))}
                className={`flex items-center justify-center gap-2 py-2.5 text-[13px] font-bold rounded-lg transition-all ${
                  form.role === role
                    ? "bg-white text-[#016496] shadow-sm"
                    : "text-slate-500 hover:text-[#0d3349]"
                }`}
              >
                {role === ROLES.TEACHER ? "👨‍🏫 Teacher" : "🎓 Student"}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-[11.5px] font-bold text-[#0d3349]/70 mb-1.5">Full Name *</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Raj"
              className={`w-full border rounded-xl px-4 py-2.5 text-[13.5px] font-medium text-[#0d3349] placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-all ${
                errors.name ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-[#016496]/20 bg-slate-50/30"
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[11.5px] font-bold text-[#0d3349]/70 mb-1.5">Institutional Email *</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="faculty@academy.edu"
              className={`w-full border rounded-xl px-4 py-2.5 text-[13.5px] font-medium text-[#0d3349] placeholder:text-slate-300 focus:outline-none focus:ring-2 transition-all ${
                errors.email ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-[#016496]/20 bg-slate-50/30"
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11.5px] font-bold text-[#0d3349]/70 mb-1.5">Department *</label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className={`w-full border rounded-xl px-4 py-2.5 text-[13.5px] font-medium text-[#0d3349] focus:outline-none focus:ring-2 bg-white transition-all appearance-none cursor-pointer ${
                  errors.department ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-[#016496]/20 bg-slate-50/30"
                }`}
              >
                <option value="">Select...</option>
                {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11.5px] font-bold text-[#0d3349]/70 mb-1.5">Course *</label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                className={`w-full border rounded-xl px-4 py-2.5 text-[13.5px] font-medium text-[#0d3349] focus:outline-none focus:ring-2 bg-white transition-all appearance-none cursor-pointer ${
                  errors.course ? "border-red-400 focus:ring-red-200" : "border-slate-200 focus:ring-[#016496]/20 bg-slate-50/30"
                }`}
              >
                <option value="">Select...</option>
                {COURSES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11.5px] font-bold text-[#0d3349]/70 mb-1.5">Phone Number</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+977 9869454636"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[13.5px] font-medium text-[#0d3349] placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#016496]/20 bg-slate-50/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11.5px] font-bold text-[#0d3349]/70 mb-1.5">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-[13.5px] font-medium text-[#0d3349] focus:outline-none focus:ring-2 focus:ring-[#016496]/20 bg-white transition-all appearance-none cursor-pointer"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>On Leave</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold border border-slate-200 rounded-xl hover:bg-slate-50 transition-all">Cancel</button>
            <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-[#016496] rounded-xl hover:bg-[#005a87] transition-all">
              {editingUser ? "Update Profile" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import type { StudentFormData, Gender, Department } from '../types/student';
import { useStudents } from '../context/StudentContext';

const departments: Department[] = ['CSE', 'IT', 'ECE', 'Civil', 'Mech'];
const courses = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA'];

const initial: StudentFormData = {
  firstName: '', lastName: '', fatherName: '', dateOfBirth: '',
  mobileNo: '', email: '', password: '', gender: 'Male',
  department: 'CSE', course: '', city: '', address: '', photo: null,
};

export default function RegisterStudentForm() {
  const { addStudent } = useStudents();
  const [form, setForm] = useState<StudentFormData>(initial);
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, photo: e.target.files?.[0] ?? null }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const record = addStudent(form);
    setSuccessMsg(`✓ ${record.firstName} ${record.lastName} registered successfully (ID: ${record.id})`);
    setForm(initial);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const inputClass = "border border-[#e2e8f0] rounded-sm px-3 py-2 text-[14px] w-full outline-none focus:border-[#6a5182] focus:ring-1 focus:ring-[#6a5182]/20 transition-all font-sans text-[#1e293b]";
  const labelClass = "text-[14px] font-medium text-[#64748b] w-36 shrink-0";

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-sm border border-[#e2e8f0] p-6 md:p-8 shadow-sm">
      <h2 className="text-[18px] font-bold text-[#4b3f68] mb-6">Register Students</h2>

      {/* Success Banner */}
      {successMsg && (
        <div className="mb-5 bg-[#d1fae5] border border-[#a7f3d0] text-[#065f46] text-[13.5px] font-semibold px-4 py-3 rounded-sm flex items-center gap-2 animate-fade-up">
          {successMsg}
        </div>
      )}

      <div className="flex flex-col gap-4">

        {/* Student name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className={labelClass}>Student name :</label>
          <div className="flex-1 flex flex-col sm:flex-row gap-3">
            <input name="firstName" placeholder="First Name" value={form.firstName}
              onChange={handleChange} className={`${inputClass} flex-1`} required />
            <input name="lastName"  placeholder="Last Name"  value={form.lastName}
              onChange={handleChange} className={`${inputClass} flex-1`} required />
          </div>
        </div>

        {/* Father's name */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className={labelClass}>Father's name :</label>
          <input name="fatherName" value={form.fatherName}
            onChange={handleChange} className={inputClass} />
        </div>

        {/* Date of birth */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className={labelClass}>Date of birth :</label>
          <div className="flex flex-1 items-center gap-3">
            <input name="dateOfBirth" type="date" value={form.dateOfBirth}
              onChange={handleChange} className={`${inputClass} max-w-[200px]`} />
            <span className="text-[12px] text-[#64748b]">(DD-MM-YYYY)</span>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className={labelClass}>Mobile no. :</label>
          <input name="mobileNo" value={form.mobileNo}
            onChange={handleChange} className={inputClass} maxLength={10} />
        </div>

        {/* Email */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className={labelClass}>Email id :</label>
          <input name="email" type="email" value={form.email}
            onChange={handleChange} className={inputClass} required />
        </div>

        {/* Password */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className={labelClass}>Password :</label>
          <input name="password" type="password" value={form.password}
            onChange={handleChange} className={inputClass} />
        </div>

        {/* Gender */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className={labelClass}>Gender :</label>
          <div className="flex gap-4">
            {(['Male', 'Female'] as Gender[]).map(g => (
              <label key={g} className="flex items-center gap-2 text-[14px] text-[#1e293b] cursor-pointer">
                <input type="radio" name="gender" value={g}
                  checked={form.gender === g} onChange={handleChange} 
                  className="accent-[#6a5182]" />
                {g}
              </label>
            ))}
          </div>
        </div>

        {/* Department */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:pt-2 gap-2 sm:gap-3">
          <label className={labelClass}>Department :</label>
          <div className="flex gap-4 flex-wrap flex-1">
            {departments.map(d => (
              <label key={d} className="flex items-center gap-2 text-[14px] text-[#1e293b] cursor-pointer">
                <input type="checkbox" name="department" value={d}
                  checked={form.department === d}
                  onChange={() => setForm(p => ({ ...p, department: d }))} 
                  className="accent-[#6a5182] rounded" />
                {d}
              </label>
            ))}
          </div>
        </div>

        {/* Course */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className={labelClass}>Course :</label>
          <select name="course" value={form.course}
            onChange={handleChange} className={inputClass}>
            <option value="">Select Current Course</option>
            {courses.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Photo */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className={labelClass}>Student photo :</label>
          <input type="file" accept="image/*" onChange={handleFile}
            className="text-[14px] text-[#64748b] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:text-[13px] file:font-semibold file:bg-[#f3eff7] file:text-[#6a5182] hover:file:bg-[#e7dff0] transition-all cursor-pointer" />
        </div>

        {/* City */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <label className={labelClass}>City :</label>
          <input name="city" value={form.city}
            onChange={handleChange} className={inputClass} />
        </div>

        {/* Address */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:pt-2 gap-2 sm:gap-3">
          <label className={labelClass}>Address :</label>
          <textarea name="address" value={form.address}
            onChange={handleChange} rows={2}
            className={`${inputClass} resize-none`} />
        </div>

        <div className="sm:ml-36 mt-4">
          <button type="submit"
            className="bg-[#6a5182] hover:bg-[#5b4471] text-white text-[14px] font-medium px-8 py-2.5 rounded-sm transition-all shadow-sm hover:shadow active:translate-y-px">
            Register
          </button>
        </div>
      </div>
    </form>
  );
}

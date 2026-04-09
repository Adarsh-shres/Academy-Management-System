import { useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useStudents } from '../context/StudentContext';
import { provisionUser } from '../lib/userProvisioning';
import type { Department, Gender, StudentFormData } from '../types/student';

const departments: Department[] = ['CSE', 'IT', 'ECE', 'Civil', 'Mech'];
const courses = ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA'];

const initial: StudentFormData = {
  firstName: '',
  lastName: '',
  fatherName: '',
  dateOfBirth: '',
  mobileNo: '',
  email: '',
  password: '',
  gender: 'Male',
  department: 'CSE',
  course: '',
  city: '',
  address: '',
  photo: null,
};

export default function RegisterStudentForm() {
  const { refreshStudents } = useStudents();
  const [form, setForm] = useState<StudentFormData>(initial);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, photo: e.target.files?.[0] ?? null }));
  };

  const resetForm = () => {
    setForm(initial);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const fullName = `${form.firstName} ${form.lastName}`.trim();

      await provisionUser({
        email: form.email.trim().toLowerCase(),
        password: form.password,
        fullName,
        role: 'student',
        profile: {
          father_name: form.fatherName,
          date_of_birth: form.dateOfBirth,
          mobile_no: form.mobileNo,
          gender: form.gender,
          department: form.department,
          course: form.course,
          city: form.city,
          address: form.address,
        },
      });

      await refreshStudents();
      setSuccessMsg(`Student account created for ${fullName || 'the new student'}.`);
      setForm(initial);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create student account.';
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-2xl border border-[#dbe4f0] bg-[#fbfdff] px-4 py-3 text-[14px] text-[#1e293b] outline-none transition-all focus:border-[#6a5182] focus:ring-4 focus:ring-[#6a5182]/10';

  return (
    <form onSubmit={handleSubmit} className="overflow-hidden rounded-[28px] border border-white/60 bg-white shadow-[0_28px_70px_rgba(57,31,86,0.12)]">
      <div className="border-b border-[#ece4f4] bg-[linear-gradient(135deg,#eef7fb_0%,#f8f4fd_100%)] px-6 py-6 md:px-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#7b6591]">Student Enrollment</p>
        <h2 className="mt-2 text-[24px] font-extrabold tracking-tight text-[#0d3349]">Create Student Account</h2>
        <p className="mt-1 max-w-2xl text-[13px] text-[#64748b]">
          Set up the login, enrollment details, and profile fields for a new student in one clean flow.
        </p>
      </div>

      <div className="px-6 py-6 md:px-8">
        <div className="grid gap-8">
          {successMsg && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-[13.5px] font-semibold text-emerald-700">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13.5px] font-semibold text-rose-700">
              {errorMsg}
            </div>
          )}

          <section className="grid gap-4">
            <SectionHeading
              eyebrow="Identity"
              title="Student Basics"
              description="Core identity and login credentials for the new student profile."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="First Name">
                <input name="firstName" placeholder="First name" value={form.firstName} onChange={handleChange} className={inputClass} required />
              </Field>
              <Field label="Last Name">
                <input name="lastName" placeholder="Last name" value={form.lastName} onChange={handleChange} className={inputClass} required />
              </Field>
              <Field label="Father's Name">
                <input name="fatherName" value={form.fatherName} onChange={handleChange} className={inputClass} placeholder="Parent / guardian name" />
              </Field>
              <Field label="Email">
                <input name="email" type="email" value={form.email} onChange={handleChange} className={inputClass} required placeholder="student@school.edu" />
              </Field>
              <Field label="Temporary Password">
                <input name="password" type="password" value={form.password} onChange={handleChange} className={inputClass} minLength={8} required placeholder="Minimum 8 characters" />
              </Field>
              <Field label="Date Of Birth">
                <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} className={inputClass} />
              </Field>
            </div>
          </section>

          <section className="grid gap-4">
            <SectionHeading
              eyebrow="Academic Placement"
              title="Enrollment Details"
              description="Assign the department, course, and active academic identity."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Department">
                <select name="department" value={form.department} onChange={handleChange} className={inputClass}>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Course">
                <select name="course" value={form.course} onChange={handleChange} className={inputClass}>
                  <option value="">Select course</option>
                  {courses.map((course) => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Mobile No">
                <input name="mobileNo" value={form.mobileNo} onChange={handleChange} className={inputClass} maxLength={10} placeholder="Phone number" />
              </Field>
              <Field label="Gender">
                <div className="grid grid-cols-2 gap-3">
                  {(['Male', 'Female'] as Gender[]).map((gender) => (
                    <label
                      key={gender}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-[14px] font-semibold transition-all ${
                        form.gender === gender
                          ? 'border-[#6a5182] bg-[#f6f0fb] text-[#6a5182]'
                          : 'border-[#dbe4f0] bg-[#fbfdff] text-[#475569]'
                      }`}
                    >
                      <input type="radio" name="gender" value={gender} checked={form.gender === gender} onChange={handleChange} className="sr-only" />
                      {gender}
                    </label>
                  ))}
                </div>
              </Field>
            </div>
          </section>

          <section className="grid gap-4">
            <SectionHeading
              eyebrow="Contact"
              title="Location & Extras"
              description="Keep address and supporting profile details in one visible section."
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="City">
                <input name="city" value={form.city} onChange={handleChange} className={inputClass} placeholder="City" />
              </Field>
              <Field label="Student Photo">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="w-full rounded-2xl border border-dashed border-[#dbe4f0] bg-[#fbfdff] px-4 py-3 text-[14px] text-[#64748b] file:mr-4 file:rounded-xl file:border-0 file:bg-[#f3eff7] file:px-4 file:py-2 file:text-[13px] file:font-semibold file:text-[#6a5182] hover:file:bg-[#e7dff0]"
                />
              </Field>
              <div className="md:col-span-2">
                <Field label="Address">
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={4}
                    className={`${inputClass} resize-none`}
                    placeholder="Street, ward, city, and any useful contact notes"
                  />
                </Field>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-[#ece4f4] pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={resetForm}
            className="rounded-2xl border border-[#e2d9ed] bg-[#f7f2fb] px-5 py-3 text-[14px] font-bold text-[#6a5182] transition-all hover:bg-[#eadff4]"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-2xl bg-[#6a5182] px-6 py-3 text-[14px] font-bold text-white shadow-[0_16px_30px_rgba(106,81,130,0.22)] transition-all hover:bg-[#5b4471] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating Student...' : 'Create Student Account'}
          </button>
        </div>
      </div>
    </form>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#7b6591]">{eyebrow}</p>
      <h3 className="mt-2 text-[20px] font-extrabold tracking-tight text-[#0d3349]">{title}</h3>
      <p className="mt-1 text-[13px] text-[#64748b]">{description}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <label className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748b]">{label}</label>
      {children}
    </div>
  );
}

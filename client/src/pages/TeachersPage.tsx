import TeacherHeaderCard from '../components/TeacherHeaderCard';

export default function TeachersPage() {
  return (
    <div className="flex flex-col gap-6 md:gap-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-[#0d3349] tracking-tight">Teachers</h1>
          <p className="text-[14px] text-[#64748b] mt-1">Manage and view faculty members</p>
        </div>
      </div>

      {/* Teacher Header Card Preview */}
      <TeacherHeaderCard
        fullName="Dr. Ramesh Kumar"
        subject="Quantum Physics & Applied Mechanics"
        employeeId="FAC-00247"
        department="Dept. of Physics"
        status="Active"
      />

      <TeacherHeaderCard
        fullName="Prof. Sunita Sharma"
        subject="Data Structures & Algorithms"
        employeeId="FAC-00189"
        department="Dept. of Computer Science"
        status="On Leave"
      />

      <TeacherHeaderCard
        fullName="Dr. Amit Joshi"
        subject="Structural Engineering"
        employeeId="FAC-00312"
        department="Dept. of Civil Engineering"
        status="Inactive"
      />
    </div>
  );
}

interface TeacherStatCardProps {
  course: string;
  percentage: number;
  classes: number;
}

export default function TeacherStatCard({ course, percentage, classes }: TeacherStatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-[#e7dff0] bg-white p-[22px_22px_20px] shadow-[0_10px_28px_rgba(57,31,86,0.06)] flex flex-col items-center justify-center text-center min-w-[200px] shrink-0 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)] transition-all duration-200">
      <p className="font-sans text-[34px] font-extrabold text-primary leading-none tracking-tight mb-2">{percentage}%</p>
      <p className="text-[10.5px] font-bold text-[#778196] uppercase tracking-[0.08em] mb-1">{course}</p>
      <p className="text-[10px] font-bold text-[#cbd5e1] uppercase tracking-[0.05em]">{classes} Classes</p>
    </div>
  );
}

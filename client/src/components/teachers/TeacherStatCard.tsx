interface TeacherStatCardProps {
  course: string;
  percentage: number;
  classes: number;
}

export default function TeacherStatCard({ course, percentage, classes }: TeacherStatCardProps) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white rounded-sm p-5 border border-[#E1E6EE] flex flex-col items-center justify-center min-w-[180px] shrink-0 shadow-[0_10px_28px_rgba(36,37,41,0.06)] transition-transform duration-200 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(36,37,41,0.1)] cursor-default">
      <div className="relative w-[100px] h-[100px] flex items-center justify-center">
        <svg width="100" height="100" className="rotate-[-90deg]">
          <circle cx="50" cy="50" r={radius} stroke="#efe8f5" strokeWidth="8" fill="none" />
          <circle 
            cx="50" 
            cy="50" 
            r={radius} 
            stroke="#3E4FFF" 
            strokeWidth="8" 
            fill="none" 
            strokeDasharray={circumference} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <span className="absolute text-[18px] font-extrabold text-[#232529] tracking-tight">{percentage}%</span>
      </div>
      
      <div className="mt-4 text-center">
        <h4 className="text-[14px] font-bold text-[#232529]">{course}</h4>
        <p className="text-[12px] text-[#64748b] font-medium mt-0.5">{classes} Classes</p>
      </div>
    </div>
  );
}


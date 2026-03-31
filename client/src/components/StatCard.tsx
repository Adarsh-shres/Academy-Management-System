import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subContent: ReactNode;
  linkText?: string;
  isAccent?: boolean;
}

export default function StatCard({ icon, label, value, subContent, linkText, isAccent }: StatCardProps) {
  return (
    <div className={`bg-white border border-[#e2e8f0] rounded-2xl p-[22px_22px_20px] relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
      ${isAccent ? 'border-t-[3px] border-t-primary' : ''}
    `}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
      
      <div className="w-[38px] h-[38px] bg-[#e6f7f9] rounded-[10px] flex items-center justify-center text-primary mb-[14px]">
        {icon}
      </div>
      
      <div className="text-[10.5px] font-bold text-[#64748b] uppercase tracking-[0.07em] mb-1.5">
        {label}
      </div>
      
      <div className="font-sans text-[34px] font-extrabold text-[#0d3349] leading-none mb-[7px] tracking-tight">
        {value}
      </div>
      
      <div className="text-[12px] text-[#64748b] flex items-center gap-1 flex-wrap">
        {subContent}
      </div>
      
      {linkText && (
        <div className="absolute bottom-[18px] right-5 text-[11.5px] font-bold text-primary cursor-pointer tracking-wide transition-opacity hover:opacity-70">
          {linkText}
        </div>
      )}
    </div>
  );
}

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
    <div className={`relative overflow-hidden rounded-sm border border-[#e7dff0] bg-white p-[22px_22px_20px] shadow-[0_10px_28px_rgba(57,31,86,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)]
      ${isAccent ? 'ring-1 ring-[#e0d6ef]' : ''}
    `}>
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5effa] via-transparent to-transparent pointer-events-none"></div>
      
      <div className="relative w-[38px] h-[38px] bg-[#f3eff7] rounded-[8px] flex items-center justify-center text-primary mb-[14px]">
        {icon}
      </div>
      
      <div className="relative text-[10.5px] font-bold text-[#778196] uppercase tracking-[0.08em] mb-1.5">
        {label}
      </div>
      
      <div className="relative font-sans text-[34px] font-extrabold text-[#4b3f68] leading-none mb-[7px] tracking-tight">
        {value}
      </div>
      
      <div className="relative text-[12px] text-[#64748b] flex items-center gap-1 flex-wrap pb-5">
        {subContent}
      </div>
      
      {linkText && (
        <div className="absolute bottom-[18px] right-5 text-[11.5px] font-bold text-primary cursor-pointer tracking-wide transition-opacity hover:opacity-70">
          {linkText}
        </div>
      )}

      <div className="relative mt-3 h-[4px] rounded-full bg-[#efe8f5] overflow-hidden">
        <div className={`h-full rounded-full ${isAccent ? 'w-[72%]' : 'w-[58%]'} bg-gradient-to-r from-[#6a5182] to-[#8b6ca8]`}></div>
      </div>
    </div>
  );
}

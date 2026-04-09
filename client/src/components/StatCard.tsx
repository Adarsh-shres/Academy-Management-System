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
    <div className={`relative overflow-hidden rounded-[10px] border border-[#e7dff0] bg-white p-5 shadow-[0_2px_12px_rgba(57,31,86,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(57,31,86,0.08)]
      ${isAccent ? 'ring-1 ring-[#e0d6ef]' : ''}
    `}>
      <div className="w-[36px] h-[36px] bg-[#f3eff7] rounded-[8px] flex items-center justify-center text-primary mb-3.5">
        {icon}
      </div>
      
      <div className="text-[11px] font-semibold text-[#778196] uppercase tracking-[0.06em] mb-1.5">
        {label}
      </div>
      
      <div className="font-sans text-[30px] font-bold text-[#4b3f68] leading-none mb-2 tracking-tight">
        {value}
      </div>
      
      <div className="text-[12px] text-[#64748b] flex items-center gap-1 flex-wrap pb-4">
        {subContent}
      </div>
      
      {linkText && (
        <div className="absolute bottom-[18px] right-5 text-[11.5px] font-semibold text-primary cursor-pointer tracking-wide transition-opacity hover:opacity-70">
          {linkText}
        </div>
      )}

      <div className="mt-1 h-[3px] rounded-full bg-[#efe8f5] overflow-hidden">
        <div className={`h-full rounded-full ${isAccent ? 'w-[72%]' : 'w-[58%]'} bg-gradient-to-r from-[#6a5182] to-[#8b6ca8]`}></div>
      </div>
    </div>
  );
}

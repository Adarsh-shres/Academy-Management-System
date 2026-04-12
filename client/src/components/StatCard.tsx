import type { ReactNode } from 'react';

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string;
  subContent?: ReactNode;
  linkText?: string;
  isAccent?: boolean;
  onClick?: () => void;
  compact?: boolean;
  showProgress?: boolean;
}

export default function StatCard({ icon, label, value, subContent, linkText, isAccent, onClick, compact = false, showProgress = true }: StatCardProps) {
  const sharedClassName = `relative w-full overflow-hidden rounded-sm border border-[#e7dff0] bg-white ${compact ? 'p-[14px_16px]' : 'p-[22px_22px_20px]'} shadow-[0_10px_28px_rgba(57,31,86,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)] text-left
      ${isAccent ? 'ring-1 ring-[#e0d6ef]' : ''}
      ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5182]/20' : 'cursor-default'}
    `;

  const content = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5effa] via-transparent to-transparent pointer-events-none"></div>

      {compact ? (
        <>
          <div className="relative flex min-h-[58px] items-center gap-4">
            <div className="w-[40px] h-[40px] bg-[#f3eff7] rounded-[10px] flex items-center justify-center text-primary shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
              {icon}
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold text-[#778196] uppercase tracking-[0.12em]">
                {label}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-3 shrink-0">
              <div className="h-9 w-px bg-[#ece4f4]"></div>
              <div className="text-right">
                <div className="font-sans text-[30px] font-extrabold text-[#4b3f68] leading-none tracking-tight">
                  {value}
                </div>
                <div className="mt-1 text-[9px] font-bold uppercase tracking-[0.14em] text-[#9aa4b5]">
                  Total
                </div>
              </div>
              {onClick ? (
                <div className="text-[#cdbfdd] transition-colors group-hover:text-[#6a5182]">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="relative w-[38px] h-[38px] bg-[#f3eff7] rounded-[8px] flex items-center justify-center text-primary mb-[14px]">
            {icon}
          </div>

          <div className="relative text-[10.5px] font-bold text-[#778196] uppercase tracking-[0.08em] mb-1.5">
            {label}
          </div>

          <div className={`relative font-sans text-[34px] font-extrabold text-[#4b3f68] leading-none tracking-tight ${subContent ? 'mb-[7px]' : 'mb-5'}`}>
            {value}
          </div>
        </>
      )}
      
      {subContent ? (
        <div className="relative text-[12px] text-[#64748b] flex items-center gap-1 flex-wrap pb-5">
          {subContent}
        </div>
      ) : null}
      
      {linkText && (
        <div className="absolute bottom-[18px] right-5 text-[11.5px] font-bold text-primary cursor-pointer tracking-wide transition-opacity hover:opacity-70">
          {linkText}
        </div>
      )}

      {showProgress ? (
        <div className={`relative ${compact ? 'mt-2' : 'mt-3'} h-[4px] rounded-full bg-[#efe8f5] overflow-hidden`}>
          <div className={`h-full rounded-full ${isAccent ? 'w-[72%]' : 'w-[58%]'} bg-gradient-to-r from-[#6a5182] to-[#8b6ca8]`}></div>
        </div>
      ) : null}
    </>
  );

  if (!onClick) {
    return <div className={sharedClassName}>{content}</div>;
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={sharedClassName}>
      {content}
    </button>
  );
}

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

export default function StatCard({
  icon,
  label,
  value,
  subContent,
  linkText,
  isAccent,
  onClick,
  compact = false,
  showProgress = true,
}: StatCardProps) {
  const sharedClassName = `group relative w-full overflow-hidden rounded-[10px] border border-[#e7dff0] bg-white ${
    compact ? 'p-[14px_16px]' : 'p-5'
  } shadow-[0_10px_28px_rgba(57,31,86,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(57,31,86,0.1)] text-left ${
    isAccent ? 'ring-1 ring-[#e0d6ef]' : ''
  } ${onClick ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6a5182]/20' : 'cursor-default'}`;

  const content = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-[#f5effa] via-transparent to-transparent pointer-events-none" />

      {compact ? (
        <div className="relative flex min-h-[58px] items-center gap-4">
          <div className="h-[40px] w-[40px] shrink-0 rounded-[10px] bg-[#f3eff7] text-primary flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            {icon}
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#778196]">
              {label}
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <div className="h-9 w-px bg-[#ece4f4]" />
            <div className="text-right">
              <div className="font-sans text-[30px] font-extrabold leading-none tracking-tight text-[#4b3f68]">
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
      ) : (
        <>
          <div className="relative mb-3.5 flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[#f3eff7] text-primary">
            {icon}
          </div>

          <div className="relative mb-1.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-[#778196]">
            {label}
          </div>

          <div className={`relative font-sans text-[30px] font-bold leading-none tracking-tight text-[#4b3f68] ${subContent ? 'mb-2' : 'mb-4'}`}>
            {value}
          </div>
        </>
      )}

      {subContent ? (
        <div className={`relative flex flex-wrap items-center gap-1 text-[12px] text-[#64748b] ${showProgress ? 'pb-4' : ''}`}>
          {subContent}
        </div>
      ) : null}

      {linkText ? (
        <div className="absolute bottom-[18px] right-5 text-[11.5px] font-semibold tracking-wide text-primary transition-opacity hover:opacity-70">
          {linkText}
        </div>
      ) : null}

      {showProgress ? (
        <div className={`relative overflow-hidden rounded-full bg-[#efe8f5] ${compact ? 'mt-2 h-[4px]' : 'mt-1 h-[3px]'}`}>
          <div className={`h-full rounded-full bg-gradient-to-r from-[#6a5182] to-[#8b6ca8] ${isAccent ? 'w-[72%]' : 'w-[58%]'}`} />
        </div>
      ) : null}
    </>
  );

  if (!onClick) {
    return <div className={sharedClassName}>{content}</div>;
  }

  return (
    <button type="button" onClick={onClick} className={sharedClassName}>
      {content}
    </button>
  );
}

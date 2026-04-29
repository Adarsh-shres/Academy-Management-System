import AppModal from './AppModal';

interface ConfirmActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  subjectLabel: string;
  confirmLabel: string;
}

/** Renders a shared confirmation dialog for destructive actions. */
export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  subjectLabel,
  confirmLabel,
}: ConfirmActionModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <AppModal onClose={onClose} widthClass="max-w-lg">
      <div className="overflow-hidden rounded-2xl border border-[#f1d8dd] bg-white shadow-[0_28px_70px_rgba(15,23,42,0.18)]">
        <div className="border-b border-[#f4e2e5] bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.12),_transparent_58%),linear-gradient(180deg,#fff7f8_0%,#ffffff_100%)] px-6 py-6 md:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-rose-200 bg-white text-rose-500 shadow-sm">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-rose-500">Permanent Action</p>
                <h3 className="mt-2 text-[24px] font-extrabold tracking-tight text-[#0d3349]">{title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#64748b]">{message}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-sm border border-[#f0d7dc] bg-white p-2 text-[#9f5c68] transition-colors hover:bg-[#fff1f4]"
              aria-label="Close confirmation modal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mt-5 inline-flex max-w-full items-center rounded-2xl border border-rose-200 bg-white px-4 py-2 text-[12px] font-bold text-[#7f1d1d] shadow-sm">
            {subjectLabel}
          </div>
        </div>

        <div className="px-6 py-5 md:px-7">
          <div className="rounded-2xl border border-[#f5e7ea] bg-[#fff8f9] px-4 py-3 text-[12.5px] font-medium leading-relaxed text-[#7f1d1d]">
            This action removes the profile from the current directory view and cannot be undone from this screen.
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-[#e6d9e2] bg-[#f8f3f8] px-5 py-3 text-[14px] font-bold text-[#6a5182] transition-all hover:bg-[#efe6f4]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-2xl bg-[#e11d48] px-6 py-3 text-[14px] font-bold text-white shadow-[0_16px_30px_rgba(225,29,72,0.22)] transition-all hover:bg-[#be123c]"
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </AppModal>
  );
}

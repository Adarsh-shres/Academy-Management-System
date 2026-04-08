export interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  userName: string;
}

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, userName }: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 text-center">
      <div className="absolute inset-0 bg-[#0d3349]/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-8 border border-[#e2e8f0]">
        <div className="w-16 h-16 rounded-sm bg-rose-50 flex items-center justify-center mx-auto mb-5 border border-rose-100 shadow-sm">
          <svg className="w-8 h-8 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="text-[#4b3f68] font-extrabold text-xl mb-2 tracking-tight">Confirm Deletion</h3>
        <p className="text-[#64748b] text-[13.5px] leading-relaxed mb-8 px-2">
          Are you sure you want to remove <span className="font-bold text-[#0d3349]">{userName}</span>? This account will be permanently deactivated.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-sm border border-[#e2d9ed] bg-[#f3eff7] text-sm font-bold text-[#6a5182] hover:bg-[#eadff4] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-sm text-sm font-bold text-white bg-rose-500 hover:bg-rose-600 transition-all shadow-sm"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
}

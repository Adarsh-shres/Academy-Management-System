// DeleteConfirmModal.tsx
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
      <div className="absolute inset-0 bg-[#0d3349]/20 backdrop-blur-[2px]" onClick={onClose} />
      
      <div className="relative bg-white rounded-[23.74px] shadow-2xl w-full max-w-sm z-10 p-8 border border-slate-100">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-5 border-4 border-white shadow-sm">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="text-[#0d3349] font-extrabold text-xl mb-2 tracking-tight">Confirm Deletion</h3>
        <p className="text-[#64748b] text-[13.5px] leading-relaxed mb-8 px-2">
          Are you sure you want to remove <span className="font-bold text-[#0d3349]">{userName}</span>? This account will be permanently deactivated.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-[#64748b] hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-sm"
          >
            Yes, Remove
          </button>
        </div>
      </div>
    </div>
  );
}

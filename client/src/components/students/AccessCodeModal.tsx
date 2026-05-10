import { useState } from 'react';
import { createPortal } from 'react-dom';

interface AccessCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  expectedCode: string;
  onSuccess: () => void;
  quizTitle: string;
}

export default function AccessCodeModal({ isOpen, onClose, expectedCode, onSuccess, quizTitle }: AccessCodeModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    // Simulate slight delay for UX
    setTimeout(() => {
      if (code.trim().toUpperCase() === expectedCode.trim().toUpperCase()) {
        // Record session unlock
        sessionStorage.setItem(`quiz_unlocked_${expectedCode}`, 'true');
        onSuccess();
      } else {
        setError('Incorrect access code. Please try again.');
        setIsVerifying(false);
      }
    }, 500);
  };

  return createPortal(
    <div className="fixed inset-0 bg-[#391f56]/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white rounded-[12px] shadow-[0_20px_40px_rgba(0,0,0,0.15)] p-0 w-full max-w-md overflow-hidden relative border border-[#e7dff0]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-8 pt-8 pb-6 border-b border-[#f3eff7] bg-gradient-to-br from-[#f5effa] to-white relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-[8px] bg-white border border-[#e7dff0] flex items-center justify-center text-[#7c8697] hover:text-[#4b3f68] hover:shadow-sm transition-all"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="w-12 h-12 rounded-full bg-[#f3eff7] flex items-center justify-center text-[#6a5182] mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          
          <h3 className="font-sans text-[22px] font-extrabold text-[#4b3f68] tracking-tight leading-tight">Access Required</h3>
          <p className="text-[13px] text-[#7c8697] mt-1.5 leading-relaxed">
            The quiz <strong className="text-[#4b3f68]">"{quizTitle}"</strong> requires an access code.
          </p>
        </div>

        <div className="px-8 py-7">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-[#64748b] uppercase tracking-wider">Enter Access Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-character code"
                className="bg-[#f6f2fb] border border-transparent rounded-sm px-4 py-3 text-[15px] font-semibold text-center tracking-[0.2em] w-full outline-none focus:bg-white focus:border-[#6a5182] focus:ring-[3px] focus:ring-[#6a5182]/10 transition-all text-[#1e293b] uppercase"
                maxLength={10}
                required
                autoFocus
              />
              {error && <p className="text-[12.5px] font-semibold text-red-500 mt-1 text-center animate-in slide-in-from-top-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isVerifying || !code.trim()}
              className="mt-2 w-full py-3.5 rounded-[8px] text-[13.5px] font-bold tracking-wide text-white bg-[#6a5182] hover:bg-[#5b4471] hover:shadow-md transition-all shadow-sm flex items-center justify-center gap-2 uppercase disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:shadow-sm"
            >
              {isVerifying ? 'Verifying...' : 'Unlock Quiz'}
            </button>
          </form>
        </div>
      </div>
    </div>,
    document.body
  );
}

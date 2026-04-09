import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface AppModalProps {
  children: ReactNode;
  onClose: () => void;
  widthClass?: string;
}

export default function AppModal({ children, onClose, widthClass = 'max-w-3xl' }: AppModalProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  return createPortal(
    <div className="fixed inset-0 z-[300]">
      <div className="absolute inset-0 bg-[#0d3349]/42 backdrop-blur-md" onClick={onClose} />
      <div className="absolute inset-0 overflow-y-auto">
        <div className="min-h-full flex items-start justify-center p-4 md:p-8">
          <div className={`relative w-full ${widthClass} my-6`} onClick={(event) => event.stopPropagation()}>
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

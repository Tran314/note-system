import { ReactNode, useEffect, useRef, useCallback } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'sm' | 'md' | 'lg';
}

const widths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  width = 'md' 
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousElementRef = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      previousElementRef.current = document.activeElement as HTMLElement;
      document.addEventListener('keydown', handleKeyDown);

      // Focus trap
      const modal = modalRef.current;
      if (modal) {
        const focusableElements = modal.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleTabKey = (e: KeyboardEvent) => {
          if (e.key !== 'Tab') return;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement?.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement?.focus();
            }
          }
        };

        modal.addEventListener('keydown', handleTabKey);
        firstElement?.focus();

        return () => {
          modal.removeEventListener('keydown', handleTabKey);
          document.removeEventListener('keydown', handleKeyDown);
          previousElementRef.current?.focus();
        };
      }
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        data-testid="modal-overlay"
        aria-hidden="true"
      />
      
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`relative bg-white rounded-lg shadow-xl ${widths[width]} w-full mx-4`}
      >
        {title && (
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 id="modal-title" className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        
        <div className="px-6 py-4">
          {children}
        </div>
        
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

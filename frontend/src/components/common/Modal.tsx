import { ReactNode } from 'react';

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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="overlay-enter absolute inset-0 bg-[rgba(34,28,22,0.42)] backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`nebula-panel-strong surface-enter relative mx-4 w-full rounded-[28px] ${widths[width]}`}
      >
        {title && (
          <div className="border-b border-stone-200/70 px-6 py-4">
            <h3 className="text-lg font-semibold text-stone-800">{title}</h3>
          </div>
        )}

        <div className="px-6 py-5 text-stone-700">{children}</div>

        {footer && (
          <div className="flex justify-end gap-2 border-t border-stone-200/70 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

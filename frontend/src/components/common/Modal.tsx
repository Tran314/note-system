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

export function Modal({ isOpen, onClose, title, children, footer, width = 'md' }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative mx-4 w-full rounded-lg border border-[#3a3a3a] bg-[#242424] shadow-xl ${widths[width]}`}>
        {title && (
          <div className="border-b border-[#3a3a3a] px-4 py-3">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        <div className="px-4 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-[#3a3a3a] px-4 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
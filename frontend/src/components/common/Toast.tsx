import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const toneClasses = {
  success: 'border-emerald-200/80 bg-emerald-50/92 text-emerald-800',
  error: 'border-red-200/80 bg-red-50/92 text-red-700',
  warning: 'border-amber-200/80 bg-amber-50/92 text-amber-800',
  info: 'border-stone-200/80 bg-[rgba(255,251,245,0.94)] text-stone-700',
};

export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const Icon = icons[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_20px_50px_rgba(63,44,24,0.16)] backdrop-blur-xl ${toneClasses[type]}`}
    >
      <Icon size={18} />
      <span className="text-sm">{message}</span>
      <button
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        className="ml-1 rounded-lg p-1 transition hover:bg-black/5"
      >
        <X size={16} />
      </button>
    </div>
  );
}

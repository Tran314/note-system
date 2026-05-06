import { createContext, useContext, useCallback, useState, useEffect, ReactNode, useRef } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastOptions {
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

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

<<<<<<< Updated upstream
export function Toast({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}: ToastProps) {
  const [visible, setVisible] = useState(true);
  const Icon = icons[type];
=======
let globalAddToastFn: ((message: string, type?: ToastType, options?: ToastOptions) => void) | undefined;

export function setGlobalToastFn(fn: typeof globalAddToastFn) {
  globalAddToastFn = fn;
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  if (!globalAddToastFn) {
    globalAddToastFn = context.addToast;
  }
  return context;
}

export type { ToastOptions };

export const toast = {
  success: (message: string, options?: ToastOptions) => globalAddToastFn?.(message, 'success', options),
  error: (message: string, options?: ToastOptions) => globalAddToastFn?.(message, 'error', options),
  warning: (message: string, options?: ToastOptions) => globalAddToastFn?.(message, 'warning', options),
  info: (message: string, options?: ToastOptions) => globalAddToastFn?.(message, 'info', options),
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', options?: ToastOptions) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const duration = options?.duration ?? 3000;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), duration);
    if (!globalAddToastFn) {
      globalAddToastFn = addToast;
    }
  }, [removeToast]);
>>>>>>> Stashed changes

  useEffect(() => {
    globalAddToastFn = addToast;
  }, [addToast]);

  return (
<<<<<<< Updated upstream
    <div
      className={`surface-enter fixed right-4 top-4 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-[0_20px_50px_rgba(63,44,24,0.16)] backdrop-blur-xl ${toneClasses[type]}`}
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
=======
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border shadow-lg pointer-events-auto ${colors[toast.type]}`}
            >
              <Icon size={18} />
              <span className="text-sm">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 hover:opacity-70"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
>>>>>>> Stashed changes
  );
}

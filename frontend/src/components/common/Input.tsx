import { ForwardedRef, forwardRef, InputHTMLAttributes, ReactNode } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, className = '', ...props }, ref: ForwardedRef<HTMLInputElement>) => {
    return (
      <div className="w-full">
        {label && <label className="mb-1.5 block text-sm font-medium text-[#b4b4b4]">{label}</label>}
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888888]">{icon}</div>}
          <input
            ref={ref}
            className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-[#ef4444]' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-sm text-[#ef4444]">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-[#888888]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
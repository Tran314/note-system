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
        {label && (
          <label className="block text-sm font-medium mb-1">{label}</label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`input-field ${icon ? 'pl-10' : ''} ${error ? 'border-red-500 focus:ring-red-500' : ''} ${className}`}
            {...props}
          />
        </div>
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-gray-500 text-sm mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
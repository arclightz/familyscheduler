import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', type = 'text', error = false, success = false, ...props }, ref) => {
    const baseStyles =
      'flex h-11 w-full rounded-lg border-2 bg-white px-4 py-2 text-base transition-all duration-200 placeholder:text-secondary-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-secondary-50';

    const stateStyles = error
      ? 'border-red-300 focus-visible:border-red-500 focus-visible:ring-4 focus-visible:ring-red-100'
      : success
      ? 'border-accent-green-300 focus-visible:border-accent-green-500 focus-visible:ring-4 focus-visible:ring-accent-green-100'
      : 'border-secondary-300 focus-visible:border-primary-500 focus-visible:ring-4 focus-visible:ring-primary-100 hover:border-secondary-400';

    return (
      <input
        type={type}
        className={`${baseStyles} ${stateStyles} ${className}`}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

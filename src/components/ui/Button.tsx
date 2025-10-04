import React from 'react';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 disabled:cursor-not-allowed select-none';

  const variantStyles = {
    default:
      'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-soft hover:shadow-medium focus-visible:ring-primary-500',
    primary:
      'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-soft hover:shadow-medium hover:-translate-y-0.5 focus-visible:ring-primary-500',
    secondary:
      'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300 shadow-soft hover:shadow-medium focus-visible:ring-secondary-400',
    outline:
      'border-2 border-secondary-300 bg-white text-secondary-900 hover:border-primary-500 hover:bg-primary-50 active:bg-primary-100 shadow-soft hover:shadow-medium focus-visible:ring-primary-400',
    ghost:
      'text-secondary-700 hover:bg-secondary-100 active:bg-secondary-200 focus-visible:ring-secondary-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-soft hover:shadow-medium hover:-translate-y-0.5 focus-visible:ring-red-500',
    success:
      'bg-accent-green-600 text-white hover:bg-accent-green-700 active:bg-accent-green-800 shadow-soft hover:shadow-medium hover:-translate-y-0.5 focus-visible:ring-accent-green-500',
    gradient:
      'bg-gradient-to-r from-primary-600 to-accent-purple-600 text-white hover:from-primary-700 hover:to-accent-purple-700 shadow-medium hover:shadow-large hover:-translate-y-0.5 focus-visible:ring-primary-500',
  };

  const sizeStyles = {
    xs: 'h-7 px-2.5 text-xs',
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-base',
    lg: 'h-12 px-6 text-lg',
    xl: 'h-14 px-8 text-xl',
    icon: 'h-10 w-10 p-0',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

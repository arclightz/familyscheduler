import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple' | 'orange' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  dot?: boolean;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  dot = false,
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-secondary-100 text-secondary-800 border-secondary-200',
    success: 'bg-accent-green-100 text-accent-green-800 border-accent-green-200',
    warning: 'bg-accent-orange-100 text-accent-orange-800 border-accent-orange-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-primary-100 text-primary-800 border-primary-200',
    purple: 'bg-accent-purple-100 text-accent-purple-800 border-accent-purple-200',
    orange: 'bg-accent-orange-100 text-accent-orange-800 border-accent-orange-200',
    gradient: 'bg-gradient-to-r from-primary-500 to-accent-purple-500 text-white border-transparent',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const dotColorMap = {
    default: 'bg-secondary-500',
    success: 'bg-accent-green-500',
    warning: 'bg-accent-orange-500',
    danger: 'bg-red-500',
    info: 'bg-primary-500',
    purple: 'bg-accent-purple-500',
    orange: 'bg-accent-orange-500',
    gradient: 'bg-white',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition-all duration-200 ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColorMap[variant]}`} />
      )}
      {children}
    </span>
  );
}

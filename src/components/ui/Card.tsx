import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  gradient?: boolean;
}

export function Card({ children, className = '', hover = false, gradient = false, ...props }: CardProps) {
  const baseStyles = 'rounded-xl border bg-white shadow-soft transition-all duration-300';
  const hoverStyles = hover ? 'hover:shadow-medium hover:-translate-y-1 cursor-pointer' : '';
  const gradientStyles = gradient ? 'border-transparent bg-gradient-to-br from-white to-primary-50/30' : 'border-secondary-200';

  return (
    <div
      className={`${baseStyles} ${hoverStyles} ${gradientStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }: CardProps) {
  return (
    <div className={`flex flex-col space-y-1.5 p-6 pb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }: CardProps) {
  return (
    <h3 className={`text-2xl font-bold leading-none tracking-tight text-secondary-900 ${className}`}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '' }: CardProps) {
  return <p className={`text-sm text-secondary-600 leading-relaxed ${className}`}>{children}</p>;
}

export function CardContent({ children, className = '' }: CardProps) {
  return <div className={`p-6 pt-0 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = '' }: CardProps) {
  return (
    <div className={`flex items-center p-6 pt-0 border-t border-secondary-100 mt-4 ${className}`}>{children}</div>
  );
}

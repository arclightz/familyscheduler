import React from 'react';

interface DropdownMenuProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function DropdownMenu({ open, onOpenChange, children }: DropdownMenuProps) {
  return (
    <div className="relative inline-block text-left">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { open, onOpenChange })
          : child
      )}
    </div>
  );
}

interface DropdownMenuTriggerProps {
  asChild?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function DropdownMenuTrigger({
  asChild,
  open,
  onOpenChange,
  children,
}: DropdownMenuTriggerProps) {
  const handleClick = () => {
    onOpenChange?.(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return <div onClick={handleClick}>{children}</div>;
}

interface DropdownMenuContentProps {
  align?: 'start' | 'end';
  className?: string;
  open?: boolean;
  children: React.ReactNode;
}

export function DropdownMenuContent({
  align = 'start',
  className = '',
  open,
  children,
}: DropdownMenuContentProps) {
  if (!open) return null;

  const alignmentClass = align === 'end' ? 'right-0' : 'left-0';

  return (
    <div
      className={`absolute ${alignmentClass} z-50 mt-2 min-w-[12rem] overflow-hidden rounded-md border border-gray-200 bg-white p-1 shadow-md ${className}`}
    >
      {children}
    </div>
  );
}

interface DropdownMenuItemProps {
  asChild?: boolean;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}

export function DropdownMenuItem({
  asChild,
  className = '',
  onClick,
  children,
}: DropdownMenuItemProps) {
  const baseClass =
    'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100';

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: `${baseClass} ${className}`,
    });
  }

  return (
    <div className={`${baseClass} ${className}`} onClick={onClick}>
      {children}
    </div>
  );
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-gray-200" />;
}

import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const baseClasses =
      'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer';

    const variantClasses = {
      default:
        'bg-neutral-900 text-neutral-50 shadow-xs hover:bg-neutral-800 dark:bg-neutral-50 dark:text-neutral-900',
      outline:
        'border border-neutral-200 bg-white shadow-2xs hover:bg-neutral-100 hover:text-neutral-900',
      secondary:
        'bg-neutral-100 text-neutral-900 shadow-2xs hover:bg-neutral-200/80',
      ghost: 'hover:bg-neutral-100 hover:text-neutral-900',
      link: 'text-neutral-900 underline-offset-4 hover:underline',
    }[variant];

    const sizeClasses = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-lg px-3 text-xs',
      lg: 'h-12 rounded-xl px-8 text-base',
      icon: 'h-9 w-9',
    }[size];

    const combinedClassName = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`.trim();

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: `${(children.props as any).className || ''} ${combinedClassName}`.trim(),
        ref,
        ...props,
      });
    }

    return (
      <button ref={ref} className={combinedClassName} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

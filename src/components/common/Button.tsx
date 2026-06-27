import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

// Omit `children` from HTMLMotionProps to re-declare it as ReactNode (Framer Motion allows MotionValues too)
export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref' | 'children'> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

    const variantClasses = {
      primary:     'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm border border-primary/20 hover:shadow-md hover:-translate-y-[1px]',
      secondary:   'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border hover:-translate-y-[1px]',
      outline:     'bg-transparent text-foreground border border-input hover:bg-accent hover:text-accent-foreground',
      ghost:       'bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground',
      destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
      link:        'bg-transparent text-primary underline-offset-4 hover:underline p-0 border-none hover:translate-y-0',
    };

    const sizeClasses = {
      sm:   'h-9 px-3 text-xs',
      md:   'h-10 px-4 py-2 text-sm',
      lg:   'h-12 px-6 text-base rounded-xl',
      icon: 'h-10 w-10 p-0',
    };

    const isInteractionDisabled = disabled || isLoading;

    return (
      <motion.button
        ref={ref}
        whileTap={isInteractionDisabled ? {} : { scale: 0.98 }}
        whileHover={isInteractionDisabled ? {} : { scale: 1.01 }}
        className={cn(baseStyles, variantClasses[variant], sizeClasses[size], isLoading && 'cursor-wait', className)}
        disabled={isInteractionDisabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

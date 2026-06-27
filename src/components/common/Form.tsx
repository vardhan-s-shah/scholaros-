import React from 'react';
import { cn } from '../../lib/utils';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

export const Form: React.FC<FormProps> = ({ className, children, ...props }) => {
  return (
    <form className={cn("space-y-4 w-full", className)} {...props}>
      {children}
    </form>
  );
};

export interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {}

export const FormRow: React.FC<FormRowProps> = ({ className, children, ...props }) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)} {...props}>
      {children}
    </div>
  );
};

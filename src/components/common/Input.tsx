import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  isSuccess?: boolean;
  floating?: boolean;
  leftIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, isSuccess, floating = true, leftIcon, id, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
      <div className="w-full mb-5">
        <div className="relative flex items-center">
          {/* Left Icon (optional) */}
          {leftIcon && (
            <div className="absolute left-3 text-muted-foreground z-10">
              {leftIcon}
            </div>
          )}

          {/* Core Input Field */}
          <input
            id={inputId}
            type={inputType}
            ref={ref}
            className={cn(
              "block w-full px-4 pt-6 pb-2 text-sm text-foreground bg-background rounded-lg border appearance-none transition-colors duration-200 focus:outline-none focus:ring-0",
              leftIcon ? "pl-10" : "pl-4",
              isPassword ? "pr-11" : "pr-4",
              error
                ? "border-destructive focus:border-destructive"
                : isSuccess
                ? "border-emerald-500/80 focus:border-emerald-500"
                : "border-input hover:border-muted-foreground/30 focus:border-primary",
              className
            )}
            placeholder=" " // Required for the peer-placeholder-shown floating label trick
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Floating Label */}
          {floating && (
            <label
              htmlFor={inputId}
              className={cn(
                "absolute text-sm text-muted-foreground duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] start-4 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3 pointer-events-none select-none transition-all",
                leftIcon ? "start-10" : "start-4",
                isFocused && !error && !isSuccess && "text-primary",
                error && "text-destructive",
                isSuccess && "text-emerald-500",
                // Tailwind custom selector for peer-placeholder-shown
                "input:placeholder-shown:scale-100 input:placeholder-shown:translate-y-0 input:focus:scale-75 input:focus:-translate-y-3",
                // CSS hack to trigger label floating if value is present
                "peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3",
                // If there's an actual value, force the small elevated state
                (props.value !== undefined && props.value !== '') ? "scale-75 -translate-y-3" : ""
              )}
            >
              {label}
            </label>
          )}

          {/* Right Action Icons (Password Toggle / Validation Indicator) */}
          <div className="absolute right-3 flex items-center space-x-1.5">
            {isSuccess && !error && (
              <Check className="h-4.5 w-4.5 text-emerald-500 animate-in fade-in zoom-in-75 duration-200" />
            )}
            
            {error && (
              <AlertCircle className="h-4.5 w-4.5 text-destructive animate-in fade-in zoom-in-75 duration-200" />
            )}

            {isPassword && (
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors outline-none"
              >
                {showPassword ? (
                  <EyeOff className="h-4.5 w-4.5" />
                ) : (
                  <Eye className="h-4.5 w-4.5" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Error Message Animation */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="text-xs text-destructive mt-1.5 ml-1 flex items-center"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Input.displayName = 'Input';

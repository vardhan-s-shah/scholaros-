import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/auth-service';
import { useAuthStore } from '../store/auth-store';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { ShieldAlert, ShieldCheck, Timer } from 'lucide-react';
import { motion } from 'framer-motion';

export const OtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuthStore();

  const email = location.state?.email || '';
  const initialMessage = location.state?.message || '';

  const [otp, setOtp] = useState<string[]>(new Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(initialMessage);
  
  // Timer settings
  const [timer, setTimer] = useState(60);
  const [resendCount, setResendCount] = useState(0);
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);

  // Input references for focus movement
  const inputRefs = useRef<HTMLInputElement[]>([]);

  // Redirect if no email is provided in state
  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  // Countdown timer logic
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Handle value change in OTP fields
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value;
    if (isNaN(Number(value))) return; // only allow numbers

    const newOtp = [...otp];
    // Take only the last character entered
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Clear error on change
    setApiError(null);

    // Focus next input if value is entered
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  // Handle backspace key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      const newOtp = [...otp];
      
      // If current field is empty, clear the previous field and focus it
      if (!otp[index] && index > 0) {
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        // Just clear the current field
        newOtp[index] = '';
        setOtp(newOtp);
      }
    }
  };

  // Handle paste events
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted value is a 6-digit number
    if (!/^\d{6}$/.test(pastedData)) {
      setApiError('Pasted code must be exactly 6 digits.');
      return;
    }

    const digits = pastedData.split('');
    setOtp(digits);
    setApiError(null);

    // Focus the last input field
    inputRefs.current[5]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length !== 6) {
      setApiError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      const result = await authService.verifyOtp({ email, code });
      setApiSuccess('Email verified successfully! Logging you in...');
      
      // Save credentials in Auth store
      setTimeout(() => {
        setAuth(result.user, result.tokens.accessToken);
        navigate('/dashboard', { replace: true });
      }, 1000);
    } catch (err: any) {
      setApiError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    
    // Rate limit check: warn if they've requested more than 3 times
    if (resendCount >= 3) {
      setRateLimitWarning('Security limit exceeded: You can only request a new code 3 times per session. Please contact support or try again later.');
      return;
    }

    setIsLoading(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      const result = await authService.resendOtp(email);
      setApiSuccess(result.message);
      setTimer(60 + resendCount * 30); // increase countdown penalty for successive resends (60s, 90s, 120s)
      setResendCount((prev) => prev + 1);
    } catch (err: any) {
      setApiError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <Card className="border-border/60 shadow-xl bg-card/40 backdrop-blur-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Verify Email</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to <span className="font-semibold text-foreground">{email}</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleVerify} className="space-y-6">
            
            {/* Success/Information Banners */}
            {apiSuccess && (
              <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0" />
                <span>{apiSuccess}</span>
              </div>
            )}

            {/* Error Banners */}
            {apiError && (
              <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {rateLimitWarning && (
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm rounded-lg flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                <span>{rateLimitWarning}</span>
              </div>
            )}

            {/* 6-Digit input boxes */}
            <div className="flex justify-between items-center gap-2">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  name="otp"
                  maxLength={1}
                  value={data}
                  ref={(el) => {
                    if (el) inputRefs.current[index] = el;
                  }}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-bold bg-background border border-input rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {/* Verification Button */}
            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={otp.join('').length !== 6 || !!rateLimitWarning}
            >
              Verify Code
            </Button>

            {/* Resend & Timer */}
            <div className="flex flex-col items-center justify-center space-y-2 text-sm">
              {timer > 0 ? (
                <div className="flex items-center text-muted-foreground">
                  <Timer className="h-4 w-4 mr-1.5 animate-pulse" />
                  <span>Resend code in <span className="font-semibold text-foreground">{timer}s</span></span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading || !!rateLimitWarning}
                  className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline focus:outline-none disabled:opacity-50 disabled:no-underline"
                >
                  Resend Verification Code
                </button>
              )}
            </div>
          </form>

          {/* Back to Sign In */}
          <p className="text-center text-sm text-muted-foreground mt-8 border-t border-border/10 pt-4">
            Wrong email?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Go back to Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

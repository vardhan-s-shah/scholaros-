import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { registerSchema } from '../schemas/auth.schemas';
import { authService } from '../services/auth-service';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Form } from '../components/common/Form';
import { getWhitelistedDomainsString, isWhitelistedEmail } from '../utils/whitelist';
import { cn } from '../lib/utils';
import { Check, X, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
    mode: 'onChange', // Validate on change for real-time feedback
  });

  const emailValue = watch('email');
  const passwordValue = watch('password');

  // Password strength checks
  const [strengthScore, setStrengthScore] = useState(0);
  const [criteria, setCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  useEffect(() => {
    const p = passwordValue || '';
    const checks = {
      length: p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number: /\d/.test(p),
      specialChar: /[@$!%*?&]/.test(p),
    };
    setCriteria(checks);

    const score = Object.values(checks).filter(Boolean).length;
    setStrengthScore(score);
  }, [passwordValue]);

  const getStrengthColor = () => {
    if (strengthScore <= 2) return 'bg-red-500';
    if (strengthScore <= 4) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getStrengthLabel = () => {
    if (!passwordValue) return 'None';
    if (strengthScore <= 2) return 'Weak';
    if (strengthScore <= 4) return 'Medium';
    return 'Strong';
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const result = await authService.register(data);
      // Success: Redirect to OTP page and pass email in router state
      navigate('/verify-otp', { state: { email: data.email, message: result.message } });
    } catch (err: any) {
      setApiError(err.message || 'An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isEmailValidDomain = emailValue ? isWhitelistedEmail(emailValue) : true;

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
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Register using your official college email domain.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {apiError && (
              <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Full Name */}
            <Input
              label="Full Name"
              type="text"
              error={errors.fullName?.message}
              isSuccess={!!watch('fullName') && !errors.fullName}
              {...register('fullName')}
            />

            {/* Email Address */}
            <Input
              label="College Email"
              type="email"
              error={errors.email?.message}
              isSuccess={!!emailValue && !errors.email && isEmailValidDomain}
              {...register('email')}
            />
            {emailValue && !isEmailValidDomain && (
              <p className="text-[11px] text-amber-500 -mt-3 mb-4 pl-1">
                Must be an institutional email (e.g. {getWhitelistedDomainsString()})
              </p>
            )}

            {/* Password */}
            <Input
              label="Password"
              type="password"
              error={errors.password?.message}
              isSuccess={strengthScore === 5 && !errors.password}
              {...register('password')}
            />

            {/* Password Strength Meter */}
            {passwordValue && (
              <div className="space-y-2 mb-4 -mt-3 p-3 bg-muted/30 border border-border/40 rounded-lg animate-in fade-in duration-200">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">Password strength:</span>
                  <span className={cn(
                    "font-semibold",
                    strengthScore <= 2 ? "text-red-500" : strengthScore <= 4 ? "text-amber-500" : "text-emerald-500"
                  )}>
                    {getStrengthLabel()}
                  </span>
                </div>
                <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full transition-all duration-300", getStrengthColor())}
                    style={{ width: `${(strengthScore / 5) * 100}%` }}
                  />
                </div>
                {/* Requirements Checklist */}
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    {criteria.length ? (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={criteria.length ? 'text-foreground' : 'text-muted-foreground'}>8+ Characters</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    {criteria.uppercase ? (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={criteria.uppercase ? 'text-foreground' : 'text-muted-foreground'}>1 Uppercase</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    {criteria.lowercase ? (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={criteria.lowercase ? 'text-foreground' : 'text-muted-foreground'}>1 Lowercase</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px]">
                    {criteria.number ? (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={criteria.number ? 'text-foreground' : 'text-muted-foreground'}>1 Number</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-[10px] col-span-2">
                    {criteria.specialChar ? (
                      <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="h-3 w-3 text-muted-foreground/50 shrink-0" />
                    )}
                    <span className={criteria.specialChar ? 'text-foreground' : 'text-muted-foreground'}>1 Special character (@$!%*?&)</span>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type="password"
              error={errors.confirmPassword?.message}
              isSuccess={!!watch('confirmPassword') && !errors.confirmPassword && watch('password') === watch('confirmPassword')}
              {...register('confirmPassword')}
            />

            {/* Terms and Conditions */}
            <div className="flex items-start space-x-2.5 mb-4 pl-0.5">
              <input
                id="terms"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-input text-indigo-600 focus:ring-indigo-500 focus:ring-offset-background transition-colors duration-200 cursor-pointer"
                {...register('terms')}
              />
              <label htmlFor="terms" className="text-xs text-muted-foreground cursor-pointer select-none leading-normal">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-xs text-destructive -mt-2 mb-4 ml-0.5">{errors.terms.message}</p>
            )}

            {/* Register Button */}
            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign Up
            </Button>
          </Form>

          {/* Redirect to Login */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

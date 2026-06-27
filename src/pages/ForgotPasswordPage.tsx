import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema, resetPasswordSchema } from '../schemas/auth.schemas';
import { authService } from '../services/auth-service';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Form } from '../components/common/Form';
import { ShieldAlert, ShieldCheck, Mail, KeyRound, CheckCircle2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [emailAddress, setEmailAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  // Form 1: Email Request
  const emailForm = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  // Form 2: OTP + New Password Reset
  const resetForm = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: '', code: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const passwordValue = resetForm.watch('password');

  // Password strength checks for the new password
  const getCriteria = () => {
    const p = passwordValue || '';
    return {
      length: p.length >= 8,
      uppercase: /[A-Z]/.test(p),
      lowercase: /[a-z]/.test(p),
      number: /\d/.test(p),
      specialChar: /[@$!%*?&]/.test(p),
    };
  };

  const getStrengthScore = () => {
    return Object.values(getCriteria()).filter(Boolean).length;
  };

  const onEmailSubmit = async (data: any) => {
    setIsLoading(true);
    setApiError(null);
    try {
      const result = await authService.forgotPassword(data.email);
      setEmailAddress(data.email);
      resetForm.setValue('email', data.email); // Pre-fill email in step 2
      setApiSuccess(result.message);
      setStep(2);
    } catch (err: any) {
      setApiError(err.message || 'No account found with this email.');
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: any) => {
    setIsLoading(true);
    setApiError(null);
    setApiSuccess(null);
    try {
      const result = await authService.resetPassword({
        email: emailAddress,
        code: data.code,
        password: data.password,
        confirmPassword: data.confirmPassword,
      });
      setApiSuccess(result.message);
      setStep(3);
    } catch (err: any) {
      setApiError(err.message || 'Failed to reset password. Please check the code.');
    } finally {
      setIsLoading(false);
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  const criteria = getCriteria();
  const strengthScore = getStrengthScore();

  return (
    <div className="w-full">
      <Card className="border-border/60 shadow-xl bg-card/40 backdrop-blur-md">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">Forgot Password</CardTitle>
                <CardDescription>
                  Enter your email address and we'll send you a code to reset your password.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
                  {apiError && (
                    <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-start space-x-2.5">
                      <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  <Input
                    label="College Email"
                    type="email"
                    leftIcon={<Mail className="h-4 w-4" />}
                    error={emailForm.formState.errors.email?.message}
                    {...emailForm.register('email')}
                  />

                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    Send Reset Code
                  </Button>
                </Form>

                <p className="text-center text-sm text-muted-foreground mt-6">
                  Remember your password?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign In
                  </Link>
                </p>
              </CardContent>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              <CardHeader className="space-y-1">
                <CardTitle className="text-2xl font-bold tracking-tight">Reset Password</CardTitle>
                <CardDescription>
                  We sent a 6-digit OTP code to <span className="font-semibold text-foreground">{emailAddress}</span>.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form onSubmit={resetForm.handleSubmit(onResetSubmit)}>
                  {apiSuccess && !apiError && (
                    <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm rounded-lg flex items-start space-x-2.5">
                      <ShieldCheck className="h-5 w-5 mt-0.5 shrink-0" />
                      <span>{apiSuccess}</span>
                    </div>
                  )}

                  {apiError && (
                    <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-start space-x-2.5">
                      <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                      <span>{apiError}</span>
                    </div>
                  )}

                  {/* OTP Code */}
                  <Input
                    label="6-Digit Reset Code"
                    type="text"
                    maxLength={6}
                    leftIcon={<KeyRound className="h-4 w-4" />}
                    error={resetForm.formState.errors.code?.message}
                    {...resetForm.register('code')}
                  />

                  {/* New Password */}
                  <Input
                    label="New Password"
                    type="password"
                    error={resetForm.formState.errors.password?.message}
                    isSuccess={strengthScore === 5 && !resetForm.formState.errors.password}
                    {...resetForm.register('password')}
                  />

                  {/* Password Strength Checklist */}
                  {passwordValue && (
                    <div className="space-y-2 mb-4 -mt-3 p-3 bg-muted/30 border border-border/40 rounded-lg">
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            strengthScore <= 2 ? 'bg-red-500' : strengthScore <= 4 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${(strengthScore / 5) * 100}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          {criteria.length ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground/50" />
                          )}
                          <span className={criteria.length ? 'text-foreground' : 'text-muted-foreground'}>8+ Characters</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          {criteria.uppercase ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground/50" />
                          )}
                          <span className={criteria.uppercase ? 'text-foreground' : 'text-muted-foreground'}>1 Uppercase</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          {criteria.lowercase ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground/50" />
                          )}
                          <span className={criteria.lowercase ? 'text-foreground' : 'text-muted-foreground'}>1 Lowercase</span>
                        </div>
                        <div className="flex items-center space-x-1.5 text-[10px]">
                          {criteria.number ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <X className="h-3 w-3 text-muted-foreground/50" />
                          )}
                          <span className={criteria.number ? 'text-foreground' : 'text-muted-foreground'}>1 Number</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Confirm Password */}
                  <Input
                    label="Confirm New Password"
                    type="password"
                    error={resetForm.formState.errors.confirmPassword?.message}
                    {...resetForm.register('confirmPassword')}
                  />

                  <div className="flex space-x-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-1/3"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button type="submit" className="w-2/3" isLoading={isLoading}>
                      Reset Password
                    </Button>
                  </div>
                </Form>
              </CardContent>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-center p-6 space-y-6"
            >
              <div className="flex justify-center">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
              </div>
              <div className="space-y-2">
                <CardTitle className="text-2xl font-bold tracking-tight">Password Reset Complete</CardTitle>
                <CardDescription>
                  Your password has been successfully updated. You can now log in with your new credentials.
                </CardDescription>
              </div>
              
              <Link to="/login" className="block w-full">
                <Button className="w-full">
                  Sign In
                </Button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

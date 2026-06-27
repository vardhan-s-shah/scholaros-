import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { loginSchema } from '../schemas/auth.schemas';
import { authService } from '../services/auth-service';
import { useAuthStore } from '../store/auth-store';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Form } from '../components/common/Form';
import { ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth, setRememberMe, rememberMe } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // If redirected from registration, we might have success message
  const infoMessage = location.state?.message || null;
  const initialEmail = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: initialEmail,
      password: '',
      rememberMe: rememberMe,
    },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setApiError(null);
    try {
      // Save rememberMe selection in store
      setRememberMe(!!data.rememberMe);

      const result = await authService.login({
        email: data.email,
        password: data.password,
      });

      // Update auth store with user & access token
      setAuth(result.user, result.tokens.accessToken);

      // Redirect to original page requested, or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.message === 'unverified_email') {
        // Redirect to OTP page for verification
        navigate('/verify-otp', {
          state: {
            email: data.email,
            message: 'Your email is not verified yet. We have sent a verification code to your inbox.',
          },
        });
      } else {
        setApiError(err.message || 'Invalid email or password.');
      }
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
          <CardTitle className="text-2xl font-bold tracking-tight">Sign In</CardTitle>
          <CardDescription>
            Access your ScholarOS dashboard with your college email.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit(onSubmit)}>
            {infoMessage && !apiError && (
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-sm rounded-lg animate-in fade-in slide-in-from-top-2 duration-200">
                {infoMessage}
              </div>
            )}

            {apiError && (
              <div className="p-3.5 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg flex items-start space-x-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                <ShieldAlert className="h-5 w-5 mt-0.5 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* Email Field */}
            <Input
              label="College Email"
              type="email"
              error={errors.email?.message}
              {...register('email')}
            />

            {/* Password Field */}
            <div className="relative">
              <Input
                label="Password"
                type="password"
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="absolute right-0 top-0 mt-1">
                <Link
                  to="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Remember Me checkbox */}
            <div className="flex items-center space-x-2 mb-4 pl-0.5">
              <input
                id="rememberMe"
                type="checkbox"
                className="h-4 w-4 rounded border-input text-indigo-600 focus:ring-indigo-500 focus:ring-offset-background transition-colors duration-200 cursor-pointer"
                {...register('rememberMe')}
              />
              <label
                htmlFor="rememberMe"
                className="text-xs text-muted-foreground cursor-pointer select-none font-medium"
              >
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </Form>

          {/* Social Logins Placeholder */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with (Future Module)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="w-full cursor-not-allowed text-xs text-muted-foreground/60 border-border/50" disabled>
              <svg className="mr-2 h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </Button>
            <Button variant="outline" className="w-full cursor-not-allowed text-xs text-muted-foreground/60 border-border/50" disabled>
              {/* Simple Google SVG Icon */}
              <svg className="mr-2 h-4 w-4 opacity-50" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.705 0 3.27.61 4.5 1.625l2.437-2.437C17.312 1.696 14.933 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.795 0 10.254-4.074 10.254-10.24 0-.695-.08-1.355-.22-1.955H12.24z" />
              </svg>
              Google
            </Button>
          </div>

          {/* Redirect to Register */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

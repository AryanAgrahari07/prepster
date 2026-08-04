import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Zap } from 'lucide-react';

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  college: z.string().optional(),
  branch: z.string().optional(),
  graduationYear: z
    .string()
    .transform((val) => (val === '' ? undefined : Number(val)))
    .refine((val) => !val || (val >= 2020 && val <= 2035), {
      message: 'Graduation year must be between 2020 and 2035',
    })
    .optional(),
});

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      setSuccessMsg('');
      const res = await registerUser(data);
      setSuccessMsg(res.message || 'Account created! Please verify your email.');
      setTimeout(() => navigate('/auth/verify-otp', { state: { userId: res.data.userId, email: res.data.email } }), 1500);
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Failed to create account.');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || '/v1'}/auth/google`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-secondary/30 p-5 sm:p-8 shadow-xl backdrop-blur-sm border border-border">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2.5 group">
                <img src="/logo.png" alt="Prepster" className="w-10 h-10 object-contain dark:brightness-[10] dark:saturate-0 group-hover:scale-110 transition-transform" />
                <span className="text-2xl font-bold tracking-tight font-display text-foreground">Prepster</span>
              </Link>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Create an account
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Start preparing for your dream placement.
          </p>
        </div>

        {serverError && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30">
            {serverError}
          </div>
        )}
        
        {successMsg && (
          <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-500 border border-green-500/30">
            {successMsg} Redirecting to login...
          </div>
        )}

        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={handleGoogleLogin}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign up with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="John"
              {...register('firstName')}
              error={errors.firstName?.message}
            />
            <Input
              label="Last Name"
              placeholder="Doe"
              {...register('lastName')}
              error={errors.lastName?.message}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            placeholder="name@example.com"
            {...register('email')}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Input
              label="College (Optional)"
              placeholder="IIT Bombay"
              {...register('college')}
              error={errors.college?.message}
            />
            <Input
              label="Grad Year (Optional)"
              placeholder="2025"
              type="number"
              {...register('graduationYear')}
              error={errors.graduationYear?.message}
            />
          </div>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/auth/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

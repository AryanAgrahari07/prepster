import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CheckCircle, AlertCircle } from 'lucide-react';

const schema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirm: z.string(),
}).refine(data => data.password === data.confirm, {
  message: "Passwords don't match",
  path: ['confirm'],
});

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    if (!token) {
      setServerError('Invalid reset link. Please request a new one.');
      return;
    }
    try {
      setServerError('');
      await api.post('/auth/reset-password', { token, password: data.password });
      setSuccess(true);
      setTimeout(() => navigate('/auth/login'), 3000);
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Reset failed. The link may have expired.');
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
          <h1 className="text-2xl font-bold">Invalid reset link</h1>
          <p className="text-muted-foreground text-sm">This link is invalid or has expired.</p>
          <Link to="/auth/forgot-password" className="text-primary hover:underline text-sm">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-secondary/30 p-8 shadow-xl backdrop-blur-sm border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Set new password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <h2 className="text-xl font-bold text-green-500">Password reset!</h2>
            <p className="text-muted-foreground text-sm">
              Your password has been updated. Redirecting to login…
            </p>
          </div>
        ) : (
          <>
            {serverError && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30">
                {serverError}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                id="password"
                label="New Password"
                type="password"
                placeholder="Min. 8 chars, 1 uppercase, 1 number"
                {...register('password')}
                error={errors.password?.message}
              />
              <Input
                id="confirm"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter your new password"
                {...register('confirm')}
                error={errors.confirm?.message}
              />
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Reset Password
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

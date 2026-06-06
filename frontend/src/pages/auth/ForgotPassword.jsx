import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { api } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MailCheck, ArrowLeft } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data) => {
    try {
      setServerError('');
      await api.post('/auth/forgot-password', data);
      setSent(true);
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-secondary/30 p-8 shadow-xl backdrop-blur-sm border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Reset your password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        {sent ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <MailCheck className="w-16 h-16 text-green-500" />
            <h2 className="text-xl font-bold">Check your email</h2>
            <p className="text-muted-foreground text-sm">
              If an account with that email exists, a password reset link has been sent. It expires in 1 hour.
            </p>
            <Link to="/auth/login" className="text-primary hover:underline text-sm font-medium">
              Back to login
            </Link>
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
                id="email"
                label="Email Address"
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                error={errors.email?.message}
              />
              <Button type="submit" className="w-full" isLoading={isSubmitting}>
                Send Reset Link
              </Button>
            </form>

            <div className="text-center">
              <Link to="/auth/login" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

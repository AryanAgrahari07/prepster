import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

/**
 * Shown after the user clicks the email verification link.
 * Backend redirects to this page after /v1/auth/verify-email succeeds.
 */
export default function AuthVerified() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md text-center space-y-6 rounded-xl bg-secondary/30 p-10 border border-border shadow-xl">
        <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Email Verified!</h1>
          <p className="text-muted-foreground">
            Your account is now active. You can sign in and start your preparation journey.
          </p>
        </div>
        <Link to="/auth/login">
          <Button className="w-full" size="lg">Continue to Login</Button>
        </Link>
      </div>
    </div>
  );
}

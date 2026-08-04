import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2 } from 'lucide-react';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuthStore();
  
  const [otp, setOtp] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const email = location.state?.email;
  const userId = location.state?.userId;

  useEffect(() => {
    if (!email || !userId) {
      navigate('/auth/register');
    }
  }, [email, userId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setServerError('Please enter a valid 6-digit OTP.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      setServerError('');
      setSuccessMsg('');
      const res = await verifyOtp(userId, otp);
      setSuccessMsg(res.message || 'Email verified! Redirecting to login...');
      setTimeout(() => navigate('/auth/login'), 2000);
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!email || !userId) return null;

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
            Verify your email
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a 6-digit verification code to <br/><strong>{email}</strong>
          </p>
        </div>

        {serverError && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30">
            {serverError}
          </div>
        )}
        
        {successMsg && (
          <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-500 border border-green-500/30">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Verification Code"
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            maxLength={6}
            className="text-center tracking-[0.5em] text-lg font-bold"
            disabled={isSubmitting || successMsg}
          />

          <Button
            type="submit"
            className="w-full text-white font-medium"
            disabled={isSubmitting || otp.length !== 6 || successMsg}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
              </span>
            ) : (
              'Verify Account'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

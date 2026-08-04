import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Loader2, Mail } from 'lucide-react';

export default function VerifyOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuthStore();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [serverError, setServerError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRefs = useRef([]);
  const email = location.state?.email;
  const userId = location.state?.userId;

  useEffect(() => {
    if (!email || !userId) {
      navigate('/auth/register');
    } else {
      inputRefs.current[0]?.focus();
    }
  }, [email, userId, navigate]);

  const handleChange = (val, idx) => {
    const clean = val.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[idx] = clean;
    setOtp(newOtp);
    if (clean && idx < 5) {
      inputRefs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setServerError('Please enter the complete 6-digit OTP.');
      return;
    }

    setIsSubmitting(true);
    try {
      setServerError('');
      setSuccessMsg('');
      await verifyOtp(userId, fullOtp);
      setSuccessMsg('Email verified! Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setServerError(err.response?.data?.error?.message || 'Verification failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const otpComplete = otp.every(d => d !== '');

  if (!email || !userId) return null;

  return (
    <div className="flex min-h-screen items-center justify-center p-3 sm:p-4 py-8 sm:py-12">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-secondary/30 p-5 sm:p-8 shadow-xl backdrop-blur-sm border border-border">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img src="/logo.png" alt="Prepster" className="w-10 h-10 object-contain dark:brightness-[10] dark:saturate-0 group-hover:scale-110 transition-transform" />
              <span className="text-2xl font-bold tracking-tight font-display text-foreground">Prepster</span>
            </Link>
          </div>
          <div className="flex justify-center mb-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="w-7 h-7 text-primary" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a 6-digit code to<br />
            <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        {/* Alerts */}
        {serverError && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/30">
            {serverError}
          </div>
        )}
        {successMsg && (
          <div className="rounded-md bg-green-500/15 p-3 text-sm text-green-600 dark:text-green-400 border border-green-500/30">
            {successMsg}
          </div>
        )}

        {/* OTP Inputs */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={el => inputRefs.current[idx] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={e => handleChange(e.target.value, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
                disabled={isSubmitting || !!successMsg}
                className="w-11 h-14 sm:w-12 sm:h-14 text-center text-xl font-bold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:opacity-50"
              />
            ))}
          </div>

          <Button
            type="submit"
            className="w-full text-white font-medium"
            disabled={isSubmitting || !otpComplete || !!successMsg}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Verifying...
              </span>
            ) : (
              'Verify & Continue'
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Wrong email?{' '}
          <Link to="/auth/register" className="text-primary hover:underline font-medium">
            Go back
          </Link>
        </p>
      </div>
    </div>
  );
}

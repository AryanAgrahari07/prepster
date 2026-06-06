import { useNavigate } from 'react-router-dom';
import { Button } from './Button';
import { Zap, X, Check } from 'lucide-react';

/**
 * PaywallModal — shown when a free user hits the daily question limit (error code 4002)
 * or attempts to access a Pro-only feature.
 *
 * Props:
 *   isOpen   - boolean
 *   onClose  - function to close the modal
 *   message  - optional custom message string
 */
export default function PaywallModal({ isOpen, onClose, message }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const proFeatures = [
    'Unlimited daily practice',
    'All 10+ company prep tracks',
    'Company mock tests',
    'Full performance analytics',
    'Direct job applications',
    'Ad-free experience',
  ];

  const handleUpgrade = () => {
    onClose?.();
    navigate('/upgrade');
  };

  return (
    <div
      id="paywall-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => e.target.id === 'paywall-modal-overlay' && onClose?.()}
    >
      <div className="relative w-full max-w-md bg-[#0f0f12] border border-primary/30 rounded-2xl p-8 shadow-[0_0_60px_rgba(99,102,241,0.15)] space-y-6">
        {/* Close button */}
        <button
          id="paywall-close"
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & heading */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <Zap className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Upgrade to Pro</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {message || "You've reached the free daily limit. Unlock unlimited access with Pro."}
          </p>
        </div>

        {/* Feature list */}
        <ul className="space-y-2">
          {proFeatures.map(f => (
            <li key={f} className="flex items-center gap-3 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-primary shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* Pricing hint */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold">₹799<span className="text-base font-normal text-muted-foreground">/year</span></p>
          <p className="text-xs text-muted-foreground mt-1">or ₹299/month — cancel anytime</p>
        </div>

        <div className="space-y-2">
          <Button id="paywall-upgrade-btn" className="w-full font-bold" size="lg" onClick={handleUpgrade}>
            <Zap className="w-4 h-4 mr-2" /> Upgrade Now
          </Button>
          <Button variant="ghost" className="w-full text-muted-foreground" size="sm" onClick={onClose}>
            Maybe later
          </Button>
        </div>
      </div>
    </div>
  );
}

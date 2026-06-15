import { useState, useEffect } from 'react';
import { api } from '@/store/authStore';
import useAuthStore from '@/store/authStore';
import { Check, Shield, Zap, Target, BookOpen, Crown, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from '@/utils/toast';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/seo/SEO';
import { motion } from 'framer-motion';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    duration: 'Forever',
    description: 'Perfect for getting started.',
    features: [
      '20 practice questions daily',
      '1 Company track unlocked (read-only)',
      'Basic analytics',
      'View job board',
    ],
    cta: 'Current Plan',
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: '₹299',
    duration: '/ month',
    description: 'Full access for your placement season.',
    features: [
      'Unlimited practice questions',
      'All company & MBA tracks unlocked',
      'Full performance analytics & radar',
      'Direct apply to job listings',
      'Company specific mock tests',
      'Ad-free experience',
    ],
    cta: 'Subscribe Monthly',
    popular: false,
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: '₹799',
    duration: '/ year',
    description: 'Best value for 2nd & 3rd year students.',
    features: [
      'Everything in Pro Monthly',
      'Save ₹2,789 annually (77% off)',
      'Priority application sorting',
      'Early access to new tracks',
    ],
    cta: 'Subscribe Annually',
    popular: true,
  },
];

export default function Upgrade() {
  const { user, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);

  // Dynamically load Razorpay SDK script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (planId) => {
    if (planId === 'free') return;
    setLoadingPlan(planId);

    try {
      // 1. Create order on backend
      const orderRes = await api.post('/subscriptions/create-order', { planId });
      const { orderId, amount, currency } = orderRes.data.data;

      // 2. If it's a mock order (dev env without Razorpay keys), skip checkout and verify immediately
      if (orderId.startsWith('mock_order_')) {
        toast.success('Development Mode: Simulating successful payment...');
        await verifyPayment({
          razorpay_order_id: orderId,
          razorpay_payment_id: `mock_pay_${Date.now()}`,
          razorpay_signature: 'mock_signature',
        }, planId);
        return;
      }

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Use public key from env
        amount,
        currency,
        name: 'Prepster',
        description: 'Upgrade to Prepster Pro',
        image: 'https://prepster.in/logo.png', // Fallback placeholder
        order_id: orderId,
        handler: async function (response) {
          await verifyPayment(response, planId);
        },
        prefill: {
          name: `${user?.profile?.firstName || ''} ${user?.profile?.lastName || ''}`,
          email: user?.email,
          contact: user?.profile?.phone || '',
        },
        theme: {
          color: '#8b5cf6', // primary violet
        },
      };

      if (!window.Razorpay) {
        toast.error('Payment gateway failed to load. Please check your connection.');
        setLoadingPlan(null);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error('Payment failed or was cancelled.');
        setLoadingPlan(null);
      });
      rzp.open();

    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to initialize payment.');
      setLoadingPlan(null);
    }
  };

  const verifyPayment = async (paymentData, planId) => {
    try {
      const res = await api.post('/subscriptions/verify', {
        ...paymentData,
        planId
      });
      
      toast.success(res.data.message || 'Pro activated successfully!');
      await checkAuth(); // Refresh user state
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Payment verification failed.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const currentPlan = user?.subscription?.plan || 'free';

  return (
    <>
      <SEO title="Upgrade to Pro | Prepster" description="Unlock unlimited practice, company tracks, and direct job applications with Prepster Pro." />
      <div className="max-w-6xl mx-auto py-8 sm:py-12 space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
              <Crown className="w-8 h-8" />
            </div>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Supercharge Your Placements
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-muted-foreground text-lg">
            Join thousands of students who cracked their dream companies with Prepster Pro.
          </motion.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto px-4">
          {PLANS.map((plan, index) => {
            const isCurrent = currentPlan === 'free' ? plan.id === 'free' : currentPlan === 'pro' && plan.id !== 'free';
            const isProAnnual = plan.id === 'pro_annual';
            const isProMonthly = plan.id === 'pro_monthly';

            return (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-background rounded-3xl p-6 sm:p-8 border-2 transition-transform hover:-translate-y-1 ${
                  plan.popular 
                    ? 'border-primary shadow-xl shadow-primary/10' 
                    : 'border-border shadow-sm hover:border-primary/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 h-10">{plan.description}</p>
                </div>
                
                <div className="mb-8">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground font-medium">{plan.duration}</span>
                </div>
                
                <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-green-500 shrink-0" />
                      <span className={plan.id === 'free' ? 'text-muted-foreground' : 'text-foreground font-medium'}>{feat}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-auto pt-4">
                  {isCurrent && plan.id === 'free' ? (
                    <Button variant="outline" className="w-full font-bold h-12" disabled>Current Plan</Button>
                  ) : currentPlan === 'pro' && plan.id !== 'free' ? (
                    <Button variant="outline" className="w-full font-bold h-12 text-primary border-primary/50 bg-primary/5" disabled>Active Subscription</Button>
                  ) : currentPlan === 'pro' && plan.id === 'free' ? (
                    <Button variant="ghost" className="w-full h-12 text-muted-foreground" disabled>Downgrade</Button>
                  ) : (
                    <Button 
                      className={`w-full font-bold h-12 ${plan.popular ? 'shadow-lg shadow-primary/20' : ''}`}
                      variant={plan.popular ? 'default' : 'secondary'}
                      onClick={() => handleSubscribe(plan.id)}
                      isLoading={loadingPlan === plan.id}
                      disabled={loadingPlan !== null}
                    >
                      {plan.cta}
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature grid */}
        <div className="max-w-4xl mx-auto pt-12 border-t border-border mt-16 px-4">
          <h2 className="text-2xl font-bold text-center mb-10">Why go Pro?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <Target className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Unlimited Practice</h4>
                <p className="text-sm text-muted-foreground mt-1">Don't let a 20-question cap slow you down. Practice as much as you need before your test.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Company Specific Tracks</h4>
                <p className="text-sm text-muted-foreground mt-1">Unlock tailored mock tests and insights for TCS, Infosys, McKinsey, and BCG.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                <Briefcase className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Direct Job Apply</h4>
                <p className="text-sm text-muted-foreground mt-1">Apply directly to exclusive listings from the Dinz partner network with one click.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h4 className="font-bold text-lg">Deep Analytics</h4>
                <p className="text-sm text-muted-foreground mt-1">Identify weak areas automatically and view your readiness score for specific companies.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-muted-foreground pt-8">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-medium">Secured by Razorpay. 100% safe and encrypted checkout.</span>
        </div>
      </div>
    </>
  );
}

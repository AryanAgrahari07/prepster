import { useState, useEffect } from 'react';
import { api } from '@/store/authStore';
import useAuthStore from '@/store/authStore';
import { Check, Shield, Zap, Target, BookOpen, Crown, Building2, Briefcase, GraduationCap, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from '@/utils/toast';
import { useNavigate, Link } from 'react-router-dom';
import SEO from '@/components/seo/SEO';
import { motion } from 'framer-motion';

const ENGINEERING_FEATURES = {
  free: [
    '20 practice questions daily',
    '1 Company track unlocked (read-only)',
    'Basic analytics',
    'View job board',
  ],
  pro_monthly: [
    'Unlimited practice questions',
    'All company & MBA tracks unlocked',
    'Full performance analytics & radar',
    'Direct apply to job listings',
    'Company specific mock tests',
    'Ad-free experience',
  ],
  pro_6months: [
    'Everything in Pro Monthly',
    'Save ₹145 vs monthly billing',
    'Priority application sorting',
    'Early access to new tracks',
  ],
  pro_annual: [
    'Everything in Pro Monthly',
    'Save ₹389 vs monthly billing',
    'Priority application sorting',
    'Early access to all new tracks & content',
  ],
};

const MBA_FEATURES = {
  free: [
    'GD topics & case study previews',
    'PI question bank (read-only)',
    'Sector exploration',
    'View WAT prompts',
  ],
  pro_monthly: [
    'Unlimited GD / PI / WAT sessions',
    'All case study solutions unlocked',
    'Guesstimate practice with frameworks',
    'AI Mock Interview access',
    'MBA performance analytics',
    'Ad-free experience',
  ],
  pro_6months: [
    'Everything in Pro Monthly',
    'Save ₹145 vs monthly billing',
    'Priority application sorting',
    'Early access to new MBA tracks',
  ],
  pro_annual: [
    'Everything in Pro Monthly',
    'Save ₹389 vs monthly billing',
    'Priority application sorting',
    'Early access to all new tracks & content',
  ],
};

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '₹0',
    duration: 'Forever',
    description: 'Explore and get started for free.',
    cta: 'Current Plan',
  },
  {
    id: 'pro_monthly',
    name: 'Pro Monthly',
    price: '₹99',
    duration: '/ month',
    description: 'Full access for your placement season.',
    cta: 'Subscribe Monthly',
    popular: false,
  },
  {
    id: 'pro_6months',
    name: 'Pro — 6 Months',
    price: '₹449',
    duration: '/ 6 months',
    description: 'Ideal for a complete placement cycle.',
    cta: 'Subscribe (6 Months)',
    popular: false,
  },
  {
    id: 'pro_annual',
    name: 'Pro Annual',
    price: '₹799',
    duration: '/ year',
    description: 'Best value — pay once, crack placements.',
    cta: 'Subscribe Annually',
    popular: true,
  },
];

export default function Upgrade() {
  const { user, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState(null);
  const isMbaUser = user?.stream === 'mba';
  const [stream, setStream] = useState(isMbaUser ? 'mba' : 'engineering');

  const features = stream === 'mba' ? MBA_FEATURES : ENGINEERING_FEATURES;

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

    // If not logged in, redirect to register
    if (!user) {
      navigate('/auth/register', { state: { from: '/upgrade' } });
      return;
    }

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
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: 'Prepster',
        description: `Upgrade to Prepster Pro (${stream === 'mba' ? 'MBA' : 'Engineering'})`,
        image: 'https://prepster.in/logo.png',
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
          color: '#8b5cf6',
        },
      };

      if (!window.Razorpay) {
        toast.error('Payment gateway failed to load. Please check your connection.');
        setLoadingPlan(null);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function () {
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
      await checkAuth();
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

          {/* Stream Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center bg-secondary rounded-xl p-1 mt-4 border border-border"
          >
            <button
              onClick={() => setStream('engineering')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                stream === 'engineering'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              Engineering
            </button>
            <button
              onClick={() => setStream('mba')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                stream === 'mba'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="w-4 h-4" />
              MBA
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto px-4">
          {PLANS.map((plan, index) => {
            const isCurrent = currentPlan === 'free' ? plan.id === 'free' : currentPlan === 'pro' && plan.id !== 'free';
            const isNotLoggedIn = !user && plan.id !== 'free';

            return (
              <motion.div 
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={`relative bg-background rounded-3xl p-6 sm:p-7 border-2 flex flex-col transition-transform hover:-translate-y-1 ${
                  plan.popular 
                    ? 'border-primary shadow-xl shadow-primary/10' 
                    : 'border-border shadow-sm hover:border-primary/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                      Best Value
                    </span>
                  </div>
                )}
                
                <div className="mb-5">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 min-h-[2.5rem]">{plan.description}</p>
                </div>
                
                <div className="mb-7">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground font-medium ml-1">{plan.duration}</span>
                </div>
                
                <ul className="space-y-3.5 mb-8 flex-1">
                  {(features[plan.id] || []).map((feat, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
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
                  ) : plan.id === 'free' ? (
                    <Button variant="outline" className="w-full font-bold h-12" disabled>Free Forever</Button>
                  ) : isNotLoggedIn ? (
                    <Link to="/auth/register" state={{ from: '/upgrade' }} className="block">
                      <Button 
                        className={`w-full font-bold h-12 ${plan.popular ? 'shadow-lg shadow-primary/20' : ''}`}
                        variant={plan.popular ? 'default' : 'secondary'}
                      >
                        Get Started
                      </Button>
                    </Link>
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
                <h4 className="font-bold text-lg">Company & MBA Tracks</h4>
                <p className="text-sm text-muted-foreground mt-1">Unlock tailored mock tests and insights for TCS, Infosys, McKinsey, BCG, and more.</p>
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

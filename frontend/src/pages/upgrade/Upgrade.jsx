import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPlans, createOrder, verifyPayment, getMySubscription, validateCoupon } from '@/api/subscription';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Check, Star, Zap, Tag, CheckCircle2, Crown } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from '@/utils/toast';

export default function Upgrade() {
  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);           // validated coupon object
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const { user, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([getPlans(), getMySubscription()])
      .then(([plansRes, subRes]) => {
        setPlans(plansRes.data?.plans || []);
        setCurrentSub(subRes.data?.subscription || { plan: 'free' });
      })
      .catch((err) => {
        console.error('Failed to load plans:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubscribe = async (plan) => {
    if (plan.price === 0) return;
    const discount = coupon
      ? coupon.type === 'percent'
        ? Math.round(plan.price * coupon.discount / 100)
        : Math.min(coupon.discount, plan.price)
      : 0;
    const finalPrice = Math.max(0, plan.price - discount);
    try {
      setProcessing(true);
      const orderRes = await createOrder(plan.id);
      
      const { orderId, amount, currency } = orderRes.data;

      // Mock checkout if keys are missing on backend
      if (orderId.startsWith('mock_order_')) {
        await handleMockPayment(orderId, plan.id);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_mock', 
        amount: amount,
        currency: currency,
        name: 'Prepster',
        description: `${plan.name} Subscription`,
        order_id: orderId,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId: plan.id
            });
            await checkAuth(); // Refresh user context
            toast.success('Payment successful! Welcome to Pro.');
            navigate('/dashboard');
          } catch (err) {
            toast.error('Verification failed');
            setProcessing(false);
          }
        },
        prefill: {
          name: user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName}` : 'Student Name',
          email: user?.email || 'student@example.com',
          contact: user?.profile?.phone || ''
        },
        theme: {
          color: '#6366f1' // Primary color
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        toast.error('Payment Failed');
        setProcessing(false);
      });
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to initiate payment');
      setProcessing(false);
    }
  };

  const handleMockPayment = async (orderId, planId) => {
    try {
      await verifyPayment({
        razorpay_order_id: orderId,
        razorpay_payment_id: `mock_pay_${Date.now()}`,
        razorpay_signature: 'mock_sig',
        planId
      });
      await checkAuth(); // Refresh user context
      toast.success('Mock Payment successful! Welcome to Pro.');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Mock Verification failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError('');
    setCoupon(null);
    try {
      const res = await validateCoupon(couponCode.trim());
      setCoupon(res.data.coupon);
    } catch (err) {
      setCouponError(err.response?.data?.error?.message || 'Invalid coupon code');
    } finally {
      setValidatingCoupon(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading plans...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Level up your preparation</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get unlimited mock tests, company-specific tracks, and direct application access to secure your dream job.
        </p>
      </div>

      <div className={`grid grid-cols-1 gap-6 mx-auto pt-8 ${
          plans.length === 1 ? "max-w-sm" : plans.length === 2 ? "md:grid-cols-2 max-w-3xl" : "lg:grid-cols-3 max-w-6xl"
      }`}>
        {plans.map((plan) => {
          const isPro = plan.price > 0;
          const isCurrent = currentSub?.plan === (isPro ? 'pro' : 'free');
          const isPopular = plan.id === 'pro_annual';

          let PlanIcon = <CheckCircle2 className="h-5 w-5 text-green-500" />;
          if (plan.id === 'pro_monthly') PlanIcon = <Zap className="h-5 w-5 text-blue-500" />;
          if (plan.id === 'pro_annual') PlanIcon = <Crown className="h-5 w-5 text-amber-500" />;

          return (
            <div 
              key={plan.id} 
              className={`bg-card rounded-2xl shadow-sm border p-6 flex flex-col ${
                isPopular ? "border-primary ring-1 ring-primary" : "border-border"
              }`}
            >
              {isPopular && (
                <div className="flex justify-center -mt-10 mb-6">
                    <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                        Most Popular
                    </span>
                </div>
              )}
              
              <div className="flex items-center space-x-3 mb-4">
                  {PlanIcon}
                  <h3 className="text-xl font-bold text-card-foreground">{plan.name}</h3>
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-card-foreground">₹{plan.price}</span>
                <span className="text-base font-medium text-muted-foreground ml-1">
                    {plan.id === 'pro_annual' ? '/yr' : plan.id === 'pro_monthly' ? '/mo' : ''}
                </span>
              </div>

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mr-2" />
                    <span className="text-sm text-card-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                variant={isPopular ? "default" : "outline"} 
                size="lg" 
                className="w-full font-bold"
                disabled={isCurrent || (isPro && processing)}
                onClick={() => handleSubscribe(plan)}
                isLoading={isPro && processing && !isCurrent}
              >
                {isCurrent ? 'Current Plan' : isPro ? `Choose ${plan.name}` : 'Downgrade'}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Coupon Code Section */}
      <div className="max-w-md mx-auto">
        <div className="bg-secondary/10 border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-bold flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Have a coupon code?</h3>
          {coupon ? (
            <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg p-3">
              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-bold text-green-500">{coupon.code} applied!</p>
                <p className="text-xs text-muted-foreground">{coupon.description}</p>
              </div>
              <button onClick={() => { setCoupon(null); setCouponCode(''); }} className="ml-auto text-xs text-muted-foreground hover:text-foreground">Remove</button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                id="coupon-code"
                placeholder="Enter code (e.g. PREPSTER20)"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleValidateCoupon()}
                error={couponError}
              />
              <Button variant="outline" onClick={handleValidateCoupon} isLoading={validatingCoupon} className="shrink-0">
                Apply
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

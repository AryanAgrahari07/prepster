import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag, Trash2, CheckCircle, XCircle } from 'lucide-react';

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await getCoupons();
      setCoupons(res.data.coupons || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = {
        code: data.code.toUpperCase(),
        discountPercent: parseInt(data.discountPercent),
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      };
      await createCoupon(payload);
      reset();
      fetchCoupons();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create coupon');
    }
  };

  const toggleActive = async (id, current) => {
    try {
      await updateCoupon(id, { isActive: !current });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await deleteCoupon(id);
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Coupons & Discounts</h1>
        <p className="text-muted-foreground mt-1">Manage promo codes for Pro subscriptions.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Tag className="w-5 h-5 text-primary" /> Create New Coupon</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <Input label="Code" placeholder="LAUNCH50" {...register('code', { required: true })} />
          <Input label="Discount %" type="number" min="1" max="100" placeholder="50" {...register('discountPercent', { required: true })} />
          <Input label="Max Uses (Optional)" type="number" min="1" placeholder="Unlimited" {...register('maxUses')} />
          <Input label="Expiry (Optional)" type="date" {...register('expiresAt')} />
          <Button type="submit" isLoading={isSubmitting} className="w-full">Create</Button>
        </form>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-medium">Code</th>
              <th className="px-6 py-4 font-medium">Discount</th>
              <th className="px-6 py-4 font-medium">Usage</th>
              <th className="px-6 py-4 font-medium">Expires</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-muted-foreground">No coupons found.</td></tr>
            ) : (
              coupons.map(c => (
                <tr key={c._id} className="hover:bg-secondary/20">
                  <td className="px-6 py-4 font-bold text-lg tracking-wider text-primary">{c.code}</td>
                  <td className="px-6 py-4 font-medium">{c.discountPercent}% OFF</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.usedCount} / {c.maxUses || '∞'}</td>
                  <td className="px-6 py-4 text-muted-foreground">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                  <td className="px-6 py-4">
                    {c.isActive ? (
                       <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full"><CheckCircle className="w-3 h-3" /> Active</span>
                    ) : (
                       <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> Disabled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleActive(c._id, c.isActive)}>
                        {c.isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { getAnnouncements, createAnnouncement, deleteAnnouncement } from '@/api/admin';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Megaphone, Trash2 } from 'lucide-react';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { audience: 'all', type: 'info' }
  });

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await getAnnouncements();
      setAnnouncements(res.data.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const onSubmit = async (data) => {
    try {
      const payload = { ...data, expiresAt: data.expiresAt ? new Date(data.expiresAt) : null };
      await createAnnouncement(payload);
      reset();
      fetchAnnouncements();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await deleteAnnouncement(id);
      fetchAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground mt-1">Push important updates or banners to users.</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Megaphone className="w-5 h-5 text-primary" /> New Announcement</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title (Short heading)" placeholder="System Maintenance" {...register('title', { required: true })} />
          
          <div>
            <label className="text-sm font-medium mb-1 block">Message Body</label>
            <textarea 
              className="w-full h-24 rounded-md border border-input bg-background p-3 text-sm focus:ring-2 focus:ring-ring"
              placeholder="Full details here..."
              {...register('body', { required: true })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Audience</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" {...register('audience')}>
                <option value="all">All Users</option>
                <option value="pro">Pro Users Only</option>
                <option value="free">Free Users Only</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Type (Color)</label>
              <select className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm" {...register('type')}>
                <option value="info">Info (Blue)</option>
                <option value="warning">Warning (Yellow)</option>
                <option value="success">Success (Green)</option>
              </select>
            </div>
            <Input label="Expiry (Optional)" type="date" {...register('expiresAt')} />
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={isSubmitting}>Publish Announcement</Button>
          </div>
        </form>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">Active & Past Announcements</h3>
        {loading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : announcements.length === 0 ? (
          <p className="text-muted-foreground">No announcements found.</p>
        ) : (
          announcements.map(a => (
            <div key={a._id} className="bg-card border border-border rounded-xl p-5 flex justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${
                    a.type === 'info' ? 'bg-blue-500/10 text-blue-500' :
                    a.type === 'warning' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                  }`}>
                    {a.type}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm bg-secondary text-muted-foreground">
                    Target: {a.audience}
                  </span>
                  {a.expiresAt && <span className="text-xs text-muted-foreground ml-2">Expires: {new Date(a.expiresAt).toLocaleDateString()}</span>}
                </div>
                <h4 className="font-bold text-foreground">{a.title}</h4>
                <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{a.body}</p>
                <p className="text-xs text-muted-foreground mt-4">Posted: {new Date(a.createdAt).toLocaleString()}</p>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => handleDelete(a._id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

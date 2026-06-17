import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getUserById, updateUser, deleteUser } from '@/api/admin';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, User as UserIcon, Mail, GraduationCap, Clock, Crown, ShieldAlert, Trash2 } from 'lucide-react';

export default function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserById(id)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(console.error);
  }, [id]);

  const handleRoleChange = async (e) => {
    const newRole = e.target.value;
    if (newRole === 'superadmin' && currentUser.role !== 'superadmin') {
      alert("Only superadmins can promote to superadmin.");
      return;
    }
    if (!window.confirm(`Change role to ${newRole}?`)) return;
    
    try {
      await updateUser(id, { role: newRole });
      setData(prev => ({ ...prev, user: { ...prev.user, role: newRole } }));
    } catch (err) {
      console.error(err);
    }
  };

  const [proLoading, setProLoading] = useState(false);
  const [proError, setProError] = useState('');

  const handleGrantPro = async () => {
    if (!window.confirm('Grant 1 year Pro access to this user?')) return;
    setProLoading(true);
    setProError('');
    try {
      await updateUser(id, { plan: 'pro' });
      const res = await getUserById(id);
      setData(res.data);
    } catch (err) {
      setProError(err.response?.data?.error?.message || 'Failed to grant Pro access.');
    } finally {
      setProLoading(false);
    }
  };

  const handleRevokePro = async () => {
    if (!window.confirm('Revoke Pro access and downgrade to Free?')) return;
    setProLoading(true);
    setProError('');
    try {
      await updateUser(id, { plan: 'free' });
      const res = await getUserById(id);
      setData(res.data);
    } catch (err) {
      setProError(err.response?.data?.error?.message || 'Failed to revoke Pro access.');
    } finally {
      setProLoading(false);
    }
  };

  const handleBan = async () => {
    if (!window.confirm('Are you sure you want to hard ban this user? This cannot be easily undone.')) return;
    try {
      await deleteUser(id);
      navigate('/admin/users');
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8">Loading user details...</div>;
  if (!data || !data.user) return <div className="p-8">User not found.</div>;

  const { user, recentSessions, recentApplications } = data;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/users">
          <Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button>
        </Link>
        <h1 className="text-3xl font-bold">User Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              {user.profile?.avatar ? (
                <img src={user.profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <UserIcon className="w-10 h-10 text-primary" />
              )}
            </div>
            <h2 className="text-xl font-bold">{user.profile?.firstName} {user.profile?.lastName}</h2>
            <div className="flex items-center gap-1 text-muted-foreground mt-1 text-sm">
              <Mail className="w-3.5 h-3.5" /> {user.email}
            </div>
            
            <div className="w-full border-t border-border mt-6 pt-4 text-left space-y-3">
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase">Role</p>
                <select 
                  className="w-full h-8 mt-1 rounded-md border border-input bg-background px-2 text-sm capitalize"
                  value={user.role}
                  onChange={handleRoleChange}
                  disabled={user.role === 'superadmin' && currentUser.role !== 'superadmin'}
                >
                  <option value="student">Student</option>
                  <option value="employer">Employer</option>
                  <option value="admin">Admin</option>
                  {currentUser.role === 'superadmin' && <option value="superadmin">Superadmin</option>}
                </select>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" /> Education
                </p>
                <p className="text-sm font-medium mt-1">{user.profile?.college || 'Not set'}</p>
                <p className="text-xs text-muted-foreground">{user.profile?.branch || 'N/A'} • {user.profile?.graduationYear || 'N/A'}</p>
                <p className="text-xs text-muted-foreground mt-1">CGPA: {user.profile?.cgpa || 'N/A'}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground font-semibold uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Joined
                </p>
                <p className="text-sm mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <h3 className="font-bold border-b border-border pb-2 mb-4">Subscription</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Plan</span>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${user.subscription?.plan === 'pro' ? 'bg-green-500/10 text-green-500' : 'bg-secondary text-muted-foreground'}`}>
                  {user.subscription?.plan === 'pro' ? 'PRO' : 'FREE'}
                </span>
              </div>
              {user.subscription?.plan === 'pro' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <span className="text-xs capitalize">{user.subscription?.status}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">Expires</span>
                    <span className="text-xs text-muted-foreground">{new Date(user.subscription?.expiresAt).toLocaleDateString()}</span>
                  </div>
                  <Button onClick={handleRevokePro} className="w-full mt-2" variant="outline" disabled={proLoading}>
                    {proLoading ? 'Updating…' : 'Revoke Pro Access'}
                  </Button>
                </>
              )}
              {user.subscription?.plan !== 'pro' && (
                <Button onClick={handleGrantPro} className="w-full mt-2" variant="outline" disabled={proLoading}>
                  <Crown className="w-4 h-4 mr-2 text-primary" />
                  {proLoading ? 'Granting…' : 'Grant Pro Access'}
                </Button>
              )}
              {proError && (
                <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mt-1">
                  {proError}
                </p>
              )}
            </div>
          </div>


          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-destructive border-b border-destructive/20 pb-2 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground mb-4">Banning a user revokes their access and cancels active subscriptions immediately.</p>
            <Button onClick={handleBan} variant="destructive" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" /> Ban User
            </Button>
          </div>
        </div>

        {/* Activity Columns */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/20">
              <h3 className="font-bold">Recent Quiz Sessions</h3>
            </div>
            {recentSessions.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">No quiz activity found.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Score</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentSessions.map(s => (
                    <tr key={s._id}>
                      <td className="px-4 py-3 capitalize">{s.sessionType.replace('-', ' ')} {s.companySlug && `(${s.companySlug})`}</td>
                      <td className="px-4 py-3 font-medium">{s.score?.percentage ? `${s.score.percentage}%` : '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 capitalize text-xs">{s.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-secondary/20">
              <h3 className="font-bold">Recent Job Applications</h3>
            </div>
            {recentApplications.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground text-center">No job applications found.</p>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Job Title</th>
                    <th className="px-4 py-3">Company</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {recentApplications.map(a => (
                    <tr key={a._id}>
                      <td className="px-4 py-3 font-medium line-clamp-1">{a.jobId?.title}</td>
                      <td className="px-4 py-3">{a.jobId?.companyName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(a.appliedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3 capitalize text-xs">{a.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

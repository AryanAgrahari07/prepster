import { useState, useEffect } from 'react';
import { getSubscriptions } from '@/api/admin';
import { Link } from 'react-router-dom';
import { Search, Crown, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SubscriptionManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchSubs = async () => {
      setLoading(true);
      try {
        const res = await getSubscriptions({ page, limit: 20, status: statusFilter });
        setUsers(res.data.subscriptions);
        setPagination(res.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubs();
  }, [page, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pro Subscriptions</h1>
        <p className="text-muted-foreground mt-1">Manage paid users and view subscription status.</p>
      </div>

      <div className="flex gap-4 mb-4">
        <select 
          className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Pro Users</option>
          <option value="active">Active Only</option>
          <option value="expired">Expired Only</option>
          <option value="cancelled">Cancelled Only</option>
        </select>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead className="bg-secondary/50 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Started At</th>
                <th className="px-6 py-4 font-medium">Expires At</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-muted-foreground">No subscribers found.</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u._id} className="hover:bg-secondary/20">
                    <td className="px-6 py-4">
                      <p className="font-bold">{u.profile?.firstName} {u.profile?.lastName}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      {u.subscription?.status === 'active' ? (
                         <span className="inline-flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full"><Crown className="w-3 h-3" /> Active</span>
                      ) : (
                         <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-500/10 px-2 py-1 rounded-full capitalize"><XCircle className="w-3 h-3" /> {u.subscription?.status}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{new Date(u.subscription?.startedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">{new Date(u.subscription?.expiresAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <Link to={`/admin/users/${u._id}`}>
                        <Button variant="outline" size="sm">View User</Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {pagination.total > 0 && (
          <div className="border-t border-border px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Page {page} of {Math.ceil(pagination.total / pagination.limit)}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <Button variant="outline" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

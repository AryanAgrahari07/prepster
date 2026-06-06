import { useState, useEffect, useCallback } from 'react';
import { api } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, ShieldCheck, User, Crown, ChevronLeft, ChevronRight } from 'lucide-react';

const ROLE_COLORS = {
  student:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
  employer:   'bg-purple-500/10 text-purple-400 border-purple-500/20',
  admin:      'bg-orange-500/10 text-orange-400 border-orange-500/20',
  superadmin: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const PLAN_COLORS = {
  free: 'bg-secondary text-muted-foreground',
  pro:  'bg-primary/10 text-primary',
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(activeSearch ? { search: activeSearch } : {}),
      });
      const res = await api.get(`/admin/users?${params}`);
      setUsers(res.data.data.users);
      setPagination(p => ({ ...p, total: res.data.data.total }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, activeSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    setActiveSearch(search);
  };

  const handleUpdateUser = async (userId, updates) => {
    setUpdatingId(userId);
    try {
      await api.patch(`/admin/users/${userId}`, updates);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...updates } : u));
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">View, search and manage all platform users.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            id="user-search"
            className="pl-9"
            placeholder="Search by email or name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading users…</div>
      ) : (
        <>
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead className="bg-secondary/30 text-muted-foreground">
                  <tr>
                    <th className="text-left p-4 font-medium">User</th>
                    <th className="text-left p-4 font-medium">Role</th>
                    <th className="text-left p-4 font-medium">Plan</th>
                    <th className="text-left p-4 font-medium hidden lg:table-cell">College</th>
                    <th className="text-left p-4 font-medium hidden lg:table-cell">Joined</th>
                    <th className="text-right p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No users found.</td>
                    </tr>
                  ) : users.map(user => (
                    <tr key={user._id} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {user.profile?.avatar
                              ? <img src={user.profile.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                              : <User className="w-4 h-4 text-primary" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.profile?.firstName} {user.profile?.lastName}
                            </p>
                            <p className="text-muted-foreground text-xs">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-md border font-medium ${ROLE_COLORS[user.role] || ''}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${PLAN_COLORS[user.subscription?.plan] || ''}`}>
                          {user.subscription?.plan === 'pro' ? '⭐ Pro' : 'Free'}
                        </span>
                      </td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground text-xs">
                        {user.profile?.college || '—'}
                      </td>
                      <td className="p-4 hidden lg:table-cell text-muted-foreground text-xs">
                        {new Date(user.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 flex-wrap">
                          {user.role !== 'admin' && user.role !== 'superadmin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              disabled={updatingId === user._id}
                              onClick={() => handleUpdateUser(user._id, {
                                role: user.role === 'employer' ? 'student' : 'employer'
                              })}
                            >
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              {user.role === 'employer' ? 'Demote' : 'Make Employer'}
                            </Button>
                          )}
                          {user.subscription?.plan !== 'pro' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs text-primary border-primary/30 hover:bg-primary/10"
                              disabled={updatingId === user._id}
                              onClick={() => handleUpdateUser(user._id, {
                                'subscription.plan': 'pro',
                                'subscription.status': 'active',
                              })}
                            >
                              <Crown className="w-3 h-3 mr-1" />
                              Grant Pro
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {pagination.total} total users — Page {pagination.page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= totalPages}
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getStats, getAnalytics } from '@/api/admin';
import { Users, BookOpen, Briefcase, FileText, TrendingUp, DollarSign } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

function StatCard({ label, value, icon: Icon, color = 'primary', sub }) {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    green: 'bg-green-500/10 text-green-500',
    blue: 'bg-blue-500/10 text-blue-500',
    yellow: 'bg-yellow-500/10 text-yellow-500',
    red: 'bg-red-500/10 text-red-500',
    purple: 'bg-purple-500/10 text-purple-500',
  };
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg shrink-0 ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value ?? '—'}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

const COLORS = ['#22c55e', '#64748b'];

export default function AdminOverview() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStats(), getAnalytics(30)])
      .then(([statsRes, analyticsRes]) => {
        setStats(statsRes.data);
        setAnalytics(analyticsRes.data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const conversionRate = stats ? ((stats.proUsers / (stats.totalUsers || 1)) * 100).toFixed(1) : '0';
  const mrr = stats ? stats.proUsers * 299 : 0; // rough estimate

  const pieData = stats ? [
    { name: 'Pro Users', value: stats.proUsers },
    { name: 'Free Users', value: stats.freeUsers }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">Platform-wide metrics and activity.</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="primary" sub={`+${stats.recentSignups} this week`} />
            <StatCard label="Pro Subscribers" value={stats.proUsers} icon={TrendingUp} color="green" sub={`${conversionRate}% conversion rate`} />
            <StatCard label="Est. MRR" value={`₹${mrr.toLocaleString()}`} icon={DollarSign} color="purple" sub="Based on monthly rate" />
            <StatCard label="Questions in Bank" value={stats.totalQuestions} icon={BookOpen} color="blue" />
            <StatCard label="Active Jobs" value={stats.activeJobs} icon={Briefcase} color="purple" />
            <StatCard label="Total Applications" value={stats.totalApplications} icon={FileText} color="yellow" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-6">User Signups (Last 30 Days)</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics?.signups || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Line type="monotone" dataKey="count" name="Signups" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-6">User Distribution</h3>
              <div className="h-[300px] flex flex-col items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold">{stats.totalUsers}</span>
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div> Pro
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full bg-[#64748b]"></div> Free
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* College Distribution */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-6">Top Colleges</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.collegeWise || []} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="college" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      cursor={{ fill: 'hsl(var(--secondary))' }}
                    />
                    <Bar dataKey="count" name="Users" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Year Distribution */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="font-bold mb-6">Graduation Years</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.yearWise || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="year" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      cursor={{ fill: 'hsl(var(--secondary))' }}
                    />
                    <Bar dataKey="count" name="Users" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

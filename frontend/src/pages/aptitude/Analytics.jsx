import { useState, useEffect } from 'react';
import { api } from '@/store/authStore';
import useAuthStore from '@/store/authStore';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';
import { Target, TrendingUp, AlertTriangle, Zap } from 'lucide-react';

const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

export default function AnalyticsDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.subscription?.plan !== 'pro') {
      setLoading(false);
      return;
    }
    
    api.get('/aptitude/analytics/me').then(res => {
      setData(res.data.data);
      setLoading(false);
    }).catch(console.error);
  }, [user]);

  if (user?.subscription?.plan !== 'pro') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh] bg-secondary/5 rounded-3xl border border-border/50">
        <div className="w-24 h-24 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 relative">
          <TrendingUp className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight">Pro Analytics</h2>
        <p className="text-muted-foreground max-w-md text-lg mb-6">
          Unlock detailed performance insights, weak area detection, and company readiness scores by upgrading to Pro.
        </p>
        <Link to="/upgrade">
          <Button size="lg" className="font-bold">Upgrade to Pro</Button>
        </Link>
      </div>
    );
  }

  if (loading) return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      <div className="h-8 w-64 bg-secondary/30 rounded animate-pulse"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-secondary/20 rounded-xl animate-pulse"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-80 bg-secondary/10 rounded-xl animate-pulse"></div>)}
      </div>
    </div>
  );

  if (!data?.analytics) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[60vh] bg-secondary/5 rounded-3xl border border-border/50">
        <div className="w-24 h-24 bg-gradient-to-tr from-primary/20 to-blue-500/20 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-ping opacity-20"></div>
          <TrendingUp className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold mb-3 tracking-tight">No Data Yet</h2>
        <p className="text-muted-foreground max-w-md text-lg">
          Start practicing to unlock your performance analytics. Complete at least one mock test or practice session to see insights.
        </p>
      </div>
    );
  }

  const { analytics, recentSessions = [] } = data;
  const accuracy = analytics.totalQuestionsAttempted
    ? Math.round((analytics.totalCorrect / analytics.totalQuestionsAttempted) * 100)
    : 0;

  // Formatting Data for Recharts
  const topicEntries = Object.entries(analytics.topicStats || {}).filter(([, val]) => val.attempted > 0);
  
  const radarData = topicEntries.map(([key, val]) => ({
    subject: key.length > 5 ? key.substring(0, 5) + '..' : key,
    fullName: key,
    Accuracy: Math.round((val.correct / val.attempted) * 100),
    fullMark: 100,
  }));

  const pieData = topicEntries.map(([key, val]) => ({
    name: key,
    value: val.attempted,
  })).sort((a, b) => b.value - a.value); // sort largest to smallest

  const barData = topicEntries.map(([key, val]) => ({
    name: key,
    Attempted: val.attempted,
    Correct: val.correct,
  }));

  const readinessData = Object.entries(analytics.companyReadiness || {}).map(([key, val]) => ({
    name: key.toUpperCase(),
    Score: val
  })).sort((a, b) => b.Score - a.Score);

  const historyData = [...recentSessions].reverse().map((s, i) => ({
    name: `Test ${i+1}`,
    score: s.score?.percentage || 0
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur border border-border/50 p-4 rounded-xl shadow-xl">
          <p className="text-sm font-bold capitalize mb-2 border-b border-border/50 pb-2">{label}</p>
          {payload.map((entry, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm mt-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
              <span className="text-muted-foreground">{entry.name}:</span>
              <span className="font-bold text-foreground">{entry.value}{entry.unit}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight">Performance Analytics</h1>
        <p className="text-muted-foreground mt-2 text-sm sm:text-lg">Track your progress, identify weak areas, and master the core subjects.</p>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-4 sm:p-6 rounded-2xl border border-primary/20 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 bg-primary/20 text-primary rounded-xl shadow-sm shrink-0">
              <Target className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Overall Accuracy</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{accuracy}%</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-4 sm:p-6 rounded-2xl border border-blue-500/20 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 bg-blue-500/20 text-blue-500 rounded-xl shadow-sm shrink-0">
              <Zap className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Attempted</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics.totalQuestionsAttempted}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-4 sm:p-6 rounded-2xl border border-green-500/20 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 bg-green-500/20 text-green-500 rounded-xl shadow-sm shrink-0">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Correct</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{analytics.totalCorrect}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-orange-500/5 p-4 sm:p-6 rounded-2xl border border-red-500/20 hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3.5 bg-red-500/20 text-red-500 rounded-xl shadow-sm shrink-0">
              <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground font-semibold uppercase tracking-wider">Weakest Topic</p>
              <p className="text-lg sm:text-xl font-bold capitalize text-foreground truncate">{analytics.weakAreas?.[0]?.replace('-', ' ') || 'None'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Chart */}
        <div className="bg-secondary/10 p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Topic Mastery (Accuracy)</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-primary/10 text-primary rounded">Radar</span>
          </div>
          <div className="h-[320px]">
            {radarData.length > 2 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Accuracy %" dataKey="Accuracy" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.4} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">Need at least 3 topics to show radar chart.</div>
            )}
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-secondary/10 p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Recent Test Scores</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-green-500/10 text-green-500 rounded">Trend</span>
          </div>
          <div className="h-[320px]">
            {historyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={val => `${val}%`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="score"
                    name="Score"
                    unit="%"
                    stroke="#10b981" 
                    strokeWidth={3}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'hsl(var(--background))' }}
                    activeDot={{ r: 6, strokeWidth: 0 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No recent test history.</div>
            )}
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="bg-secondary/10 p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Attempted vs Correct</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded">Comparison</span>
          </div>
          <div className="h-[320px]">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} dy={10} tickFormatter={val => val.length > 7 ? val.substring(0,7)+'..' : val} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--border))', opacity: 0.4 }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                  <Bar dataKey="Attempted" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="Correct" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available.</div>
            )}
          </div>
        </div>
        
        {/* Pie Chart */}
        <div className="bg-secondary/10 p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Topic Distribution</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-purple-500/10 text-purple-500 rounded">Composition</span>
          </div>
          <p className="text-xs text-muted-foreground mb-4">Breakdown of total questions attempted.</p>
          <div className="h-[300px]">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ fontSize: '11px', textTransform: 'capitalize' }}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data available.</div>
            )}
          </div>
        </div>

      </div>

      {/* Readiness Full Width Chart */}
      {readinessData.length > 0 && (
        <div className="bg-secondary/10 p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-lg">Company Readiness Score</h3>
            <span className="text-xs font-semibold px-2 py-1 bg-indigo-500/10 text-indigo-500 rounded">Readiness</span>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={readinessData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#a1a1aa" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={val => `${val}%`} />
                <YAxis type="category" dataKey="name" stroke="#a1a1aa" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                <Bar dataKey="Score" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent History Table */}
      <div className="bg-background border border-border rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-border bg-secondary/10 flex items-center justify-between gap-3">
          <h3 className="font-bold text-base sm:text-lg">Test Session History</h3>
          <span className="text-xs text-muted-foreground font-medium bg-background px-2 py-1 rounded border border-border whitespace-nowrap">Last {recentSessions.length} sessions</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-4">Date</th>
                <th className="px-4 sm:px-6 py-4">Type</th>
                <th className="px-4 sm:px-6 py-4 text-center">Score</th>
                <th className="px-4 sm:px-6 py-4 text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {recentSessions.map(session => (
                <tr key={session._id} className="hover:bg-secondary/10 transition-colors group">
                  <td className="px-4 sm:px-6 py-4 text-muted-foreground font-medium group-hover:text-foreground transition-colors whitespace-nowrap">
                    {new Date(session.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-4 sm:px-6 py-4">
                    <span className="capitalize bg-secondary px-2.5 py-1 rounded-md text-xs font-semibold">
                      {session.companySlug ? `${session.sessionType.replace('-', ' ')} (${session.companySlug})` : session.sessionType.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-center font-medium">
                    {session.score?.correct} <span className="text-muted-foreground mx-1">/</span> {session.score?.correct + session.score?.incorrect + session.score?.unattempted}
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-right">
                    <span className={`inline-block w-14 text-center px-2 py-1 rounded text-xs font-bold ${
                      session.score?.percentage >= 70 ? 'bg-green-500/10 text-green-500 border border-green-500/20' :
                      session.score?.percentage >= 40 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                      'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {Math.round(session.score?.percentage || 0)}%
                    </span>
                  </td>
                </tr>
              ))}
              {recentSessions.length === 0 && (
                <tr><td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">No recent sessions found. Time to take a mock test!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

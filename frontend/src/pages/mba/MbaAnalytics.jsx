import { useEffect, useState } from 'react';
import { getMbaAnalytics } from '@/api/mba';
import { Link } from 'react-router-dom';
import SEO from '@/components/seo/SEO';
import { motion } from 'framer-motion';
import {
  Loader2, BarChart2, MessageSquare, User, Briefcase, PenTool,
  Calculator, Star, TrendingUp, CalendarDays, Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import useAuthStore from '@/store/authStore';

// ─── Small stat card ─────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color = 'text-primary', delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="app-card p-5 flex flex-col gap-3"
    >
      <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-3xl font-black">{value ?? '—'}</p>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
}

// ─── Mini activity heatmap (last 30 days) ────────────────────────────────────
function ActivityBar({ recentActivity }) {
  if (!recentActivity?.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No activity recorded yet. Complete sessions to see your chart!
      </p>
    );
  }

  const maxCount = Math.max(...recentActivity.map(d => d.count), 1);

  return (
    <div className="flex items-end gap-1 h-20 w-full">
      {recentActivity.map((day, i) => {
        const height = Math.max((day.count / maxCount) * 100, 8);
        return (
          <div
            key={i}
            title={`${day.date}: ${day.count} session(s) — ${day.types.join(', ')}`}
            className="flex-1 rounded-sm bg-primary/70 hover:bg-primary transition-colors cursor-pointer"
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}

// ─── Type breakdown row ───────────────────────────────────────────────────────
const TYPE_META = {
  gd:          { label: 'Group Discussions', icon: MessageSquare, href: '/mba/gd',          color: 'text-blue-400' },
  pi:          { label: 'PI Sessions',        icon: User,          href: '/mba/pi',          color: 'text-purple-400' },
  case:        { label: 'Case Studies',       icon: Briefcase,     href: '/mba/cases',       color: 'text-yellow-400' },
  wat:         { label: 'WAT Essays',         icon: PenTool,       href: '/mba/wat',         color: 'text-green-400' },
  guesstimate: { label: 'Guesstimates',       icon: Calculator,    href: '/mba/guesstimates',color: 'text-orange-400' },
};

function TypeRow({ type, count, maxCount, delay }) {
  const meta = TYPE_META[type];
  if (!meta) return null;
  const Icon = meta.icon;
  const pct = maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-4"
    >
      <Link to={meta.href} className={`shrink-0 ${meta.color} hover:opacity-80 transition-opacity`}>
        <Icon className="w-5 h-5" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">{meta.label}</span>
          <span className="text-sm font-bold tabular-nums">{count}</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ delay: delay + 0.2, duration: 0.6, ease: 'easeOut' }}
            className={`h-full rounded-full bg-current ${meta.color}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MbaAnalytics() {
  const { user } = useAuthStore();
  const isPro = user?.subscription?.plan === 'pro';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMbaAnalytics()
      .then(res => { setData(res.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span>Crunching your prep data…</span>
      </div>
    );
  }

  const byType    = data?.byType    || {};
  const maxCount  = Math.max(...Object.values(byType), 1);
  const totalSess = data?.totalSessions ?? 0;

  return (
    <div className="space-y-8">
      <SEO title="MBA Analytics | Prepster" description="Track your MBA preparation progress across GD, PI, Case Studies, WAT and Guesstimates." />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">MBA Prep Analytics</h1>
        <p className="text-muted-foreground mt-1">A bird's-eye view of your preparation journey.</p>
      </div>

      {/* Pro gate — basic count is always visible, detailed breakdown requires Pro */}
      {!isPro && (
        <div className="flex items-start gap-4 p-5 bg-primary/5 border border-primary/20 rounded-xl">
          <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Upgrade for full analytics</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Free users see overall session counts. Upgrade to Pro for per-type breakdown, activity heatmap, and self-rating trends.
            </p>
          </div>
          <Link to="/upgrade">
            <Button size="sm">Upgrade</Button>
          </Link>
        </div>
      )}

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard icon={BarChart2}    label="Total Sessions"   value={totalSess}           color="text-primary"     delay={0} />
        <StatCard icon={Star}         label="Avg Self-Rating"  value={data?.avgSelfRating ? `${data.avgSelfRating}/5` : '—'} color="text-yellow-400" delay={0.05} />
        <StatCard icon={TrendingUp}   label="Days Active (30d)"value={data?.recentActivity?.length ?? 0} color="text-green-400"  delay={0.1} />
        <StatCard icon={CalendarDays} label="Last 30-Day Peak" value={data?.recentActivity?.length ? Math.max(...data.recentActivity.map(d => d.count)) : '—'} color="text-blue-400" delay={0.15} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sessions by type */}
        <div className="app-card p-6">
          <h2 className="font-bold text-lg mb-6">Sessions by Module</h2>
          {isPro ? (
            <div className="space-y-5">
              {Object.keys(TYPE_META).map((type, i) => (
                <TypeRow
                  key={type}
                  type={type}
                  count={byType[type] ?? 0}
                  maxCount={maxCount}
                  delay={i * 0.07}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {Object.keys(TYPE_META).map(type => {
                const meta = TYPE_META[type];
                const Icon = meta.icon;
                return (
                  <div key={type} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Icon className={`w-4 h-4 ${meta.color}`} />
                    <span className="flex-1">{meta.label}</span>
                    <Lock className="w-3.5 h-3.5 opacity-40" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 30-day activity */}
        <div className="app-card p-6">
          <h2 className="font-bold text-lg mb-2">30-Day Activity</h2>
          <p className="text-xs text-muted-foreground mb-6">Each bar = sessions completed on that day. Hover for details.</p>
          {isPro ? (
            <ActivityBar recentActivity={data?.recentActivity} />
          ) : (
            <div className="flex flex-col items-center justify-center h-20 gap-2 text-muted-foreground text-sm border border-dashed border-border rounded-xl">
              <Lock className="w-5 h-5 opacity-40" />
              <span>Available in Pro</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-bold text-lg mb-4">Jump Back In</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(TYPE_META).map(([type, meta]) => {
            const Icon = meta.icon;
            return (
              <Link key={type} to={meta.href}
                className="app-card p-4 flex flex-col items-center gap-2 text-center hover:border-primary/50 transition-colors group"
              >
                <Icon className={`w-6 h-6 ${meta.color} group-hover:scale-110 transition-transform`} />
                <span className="text-xs font-semibold">{meta.label}</span>
                <span className="text-[11px] text-muted-foreground">{byType[type] ?? 0} sessions</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

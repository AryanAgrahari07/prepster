import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/store/authStore';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { BookOpen, Briefcase, Building2, Zap, Target, TrendingUp, ArrowRight, Flame, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '@/components/seo/SEO';

const SESSION_TYPE_LABELS = {
  'practice': 'Practice',
  'daily-challenge': 'Daily Challenge',
  'mock-test': 'Mock Test',
  'company-mock': 'Company Mock',
};

export default function Dashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/me/stats').then(res => {
      setStats(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const firstName = user?.profile?.firstName || 'there';
  const isPro = user?.subscription?.plan === 'pro';

  return (
    <div className="space-y-8">
      <SEO title="Dashboard" description="View your performance and activities." />
      
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          {isPro
            ? 'You\'re on Pro — all features unlocked. Keep the momentum going!'
            : 'Free plan · Upgrade to Pro to unlock unlimited practice & direct apply.'}
        </p>
      </motion.div>

      {/* Pro upgrade banner */}
      {!isPro && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, delay: 0.1 }}
          className="app-card p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-primary/20 bg-primary/5"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-foreground">Upgrade to Prepster Pro</h3>
            <p className="text-muted-foreground text-sm mt-0.5">
              Unlock unlimited practice, all company tracks, direct job apply, and analytics. Starting ₹299/month.
            </p>
          </div>
          <Link to="/upgrade" className="shrink-0 w-full sm:w-auto">
            <Button className="font-semibold w-full sm:w-auto">
              Upgrade Now <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </motion.div>
      )}

      {/* Stat cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="app-card p-5 h-24 animate-pulse" />
          ))}
        </div>
      ) : stats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="app-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground truncate mr-2">Questions</p>
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold">{stats.totalQuestionsAttempted ?? 0}</p>
          </div>
          <div className="app-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Accuracy</p>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-green-500">{stats.accuracy ?? 0}%</p>
          </div>
          <div className="app-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Day Streak</p>
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-orange-500">{stats.streak?.current ?? 0}</p>
          </div>
          <div className="app-card p-4 sm:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Profile</p>
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-500">{stats.profileCompletion ?? 0}%</p>
          </div>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <h2 className="text-lg sm:text-xl font-bold mb-4">Quick Start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Practice Aptitude',
              description: 'Start a quick practice session on any topic',
              href: '/aptitude',
              icon: BookOpen,
              color: 'bg-primary/10 text-primary',
              cta: 'Start Practicing',
            },
            {
              title: 'Company Tracks',
              description: 'Prepare for specific company hiring rounds',
              href: '/companies',
              icon: Building2,
              color: 'bg-blue-500/10 text-blue-500',
              cta: 'Browse Companies',
            },
            {
              title: 'Browse Jobs',
              description: 'See latest fresher openings and internships',
              href: '/jobs',
              icon: Briefcase,
              color: 'bg-green-500/10 text-green-500',
              cta: 'View Listings',
            },
          ].map((action, index) => (
            <motion.div 
              key={action.title} 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.4, delay: 0.4 + (index * 0.1) }}
              whileHover={{ y: -5 }}
              className="app-card p-6 flex flex-col"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base">{action.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6 flex-1">{action.description}</p>
              <Link to={action.href}>
                <Button variant="outline" className="w-full justify-between group rounded-xl h-10">
                  {action.cta}
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity + Weak Areas */}
      {stats && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.5, delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Recent Sessions */}
          <div className="lg:col-span-2 app-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Recent Activity</h2>
              <Link to="/aptitude" className="text-sm text-primary hover:underline">View all →</Link>
            </div>
            {stats.recentSessions?.length > 0 ? (
              <div className="space-y-3">
                {stats.recentSessions.map((session, i) => (
                  <div key={session._id || i} className="flex items-center gap-2 sm:gap-4 p-3 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors">
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-primary/10 items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">
                        {SESSION_TYPE_LABELS[session.sessionType] || session.sessionType}
                        {session.companySlug && <span className="text-muted-foreground ml-1">· {session.companySlug.toUpperCase()}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(session.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${
                        (session.score?.percentage ?? 0) >= 70 ? 'text-green-500' : 
                        (session.score?.percentage ?? 0) >= 40 ? 'text-yellow-500' : 
                        'text-red-400'
                      }`}>
                        {session.score?.percentage ?? 0}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.score?.correct ?? 0}/{(session.score?.correct ?? 0) + (session.score?.incorrect ?? 0) + (session.score?.unattempted ?? 0)} correct
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">No sessions yet. Start your first practice!</p>
                <Link to="/aptitude" className="mt-3 inline-block">
                  <Button size="sm" className="mt-2">Start Practicing</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Weak Areas */}
          <div className="app-card p-6">
            <h2 className="text-lg font-bold mb-5">Areas to Improve</h2>
            {stats.weakAreas?.length > 0 ? (
              <div className="space-y-3">
                {stats.weakAreas.map((area) => (
                  <Link key={area} to={`/aptitude/topics/${area}`} className="block">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-colors group">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span className="text-sm font-medium capitalize flex-1">
                        {area.replace(/-/g, ' ')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-red-400 transition-colors" />
                    </div>
                  </Link>
                ))}
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Based on your performance across sessions
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingUp className="w-10 h-10 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-semibold text-green-500">Looking strong!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Complete more sessions to see topic-level insights.
                </p>
              </div>
            )}

            {/* Profile completion nudge */}
            {(stats.profileCompletion ?? 100) < 80 && (
              <div className="mt-6 pt-5 border-t border-border">
                <p className="text-xs text-muted-foreground mb-2 font-medium">Complete your profile</p>
                <div className="w-full bg-secondary rounded-full h-2 mb-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all" 
                    style={{ width: `${stats.profileCompletion}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{stats.profileCompletion}% complete</span>
                  <Link to="/profile" className="text-xs text-primary hover:underline font-medium">Update →</Link>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

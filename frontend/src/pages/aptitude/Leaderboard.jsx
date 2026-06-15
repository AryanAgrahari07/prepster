import { useState, useEffect, useMemo } from 'react';
import { api } from '@/store/authStore';
import useAuthStore from '@/store/authStore';
import { Trophy, Medal, User, Search, School, Crown } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';

const RANK_STYLES = {
  0: { icon: <Crown className="w-5 h-5 text-yellow-400" />, bg: 'bg-yellow-500/10 border-yellow-500/20', text: 'text-yellow-400' },
  1: { icon: <Medal className="w-5 h-5 text-slate-300" />,   bg: 'bg-slate-500/10 border-slate-500/20',   text: 'text-slate-300'  },
  2: { icon: <Medal className="w-5 h-5 text-amber-600" />,   bg: 'bg-amber-900/10 border-amber-800/20',   text: 'text-amber-600'  },
};

export default function Leaderboard() {
  const { user } = useAuthStore();
  const [leaderboard, setLeaderboard] = useState([]);
  const [week, setWeek]               = useState('');
  const [loading, setLoading]         = useState(true);
  const [collegeFilter, setCollegeFilter] = useState('');

  useEffect(() => {
    api.get('/aptitude/leaderboard')
      .then(res => {
        setLeaderboard(res.data.data.leaderboard || []);
        setWeek(res.data.data.week || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Unique college list for filter dropdown
  const colleges = useMemo(() => {
    const set = new Set(
      leaderboard
        .map(e => e.user?.profile?.college)
        .filter(Boolean)
    );
    return ['', ...Array.from(set).sort()];
  }, [leaderboard]);

  // Client-side college filter
  const filtered = useMemo(() => {
    if (!collegeFilter) return leaderboard;
    return leaderboard.filter(e =>
      e.user?.profile?.college?.toLowerCase().includes(collegeFilter.toLowerCase())
    );
  }, [leaderboard, collegeFilter]);

  const myUserId = user?._id;
  const myRank = leaderboard.findIndex(e => e.user?._id?.toString() === myUserId?.toString());

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <div className="h-8 w-64 bg-secondary/30 rounded animate-pulse mx-auto" />
      <div className="bg-background border border-border rounded-xl overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-border animate-pulse">
            <div className="w-8 h-8 rounded-full bg-secondary/40" />
            <div className="flex-1 h-4 bg-secondary/40 rounded" />
            <div className="w-12 h-4 bg-secondary/40 rounded" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <SEO
        title="Weekly Leaderboard | Prepster"
        description="Top performers based on accuracy this week on Prepster. Compete with students from colleges across India."
      />
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 pb-12">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
            <Trophy className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Weekly Leaderboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Top performers based on accuracy this week.</p>
          {week && <p className="text-xs text-muted-foreground font-mono bg-secondary/30 inline-block px-3 py-1 rounded-full">Week: {week}</p>}
        </motion.div>

        {/* My Rank Banner */}
        {myRank >= 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Your Rank This Week</p>
              <p className="text-xs text-muted-foreground">
                #{myRank + 1} globally · {Math.round(leaderboard[myRank]?.accuracy)}% accuracy
              </p>
            </div>
            <span className="text-2xl font-extrabold text-primary">#{myRank + 1}</span>
          </motion.div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <School className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter by college…"
              className="pl-9"
              value={collegeFilter}
              onChange={e => setCollegeFilter(e.target.value)}
            />
          </div>
          {colleges.length > 2 && (
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-ring focus:outline-none"
              value={collegeFilter}
              onChange={e => setCollegeFilter(e.target.value)}
            >
              <option value="">All Colleges</option>
              {colleges.filter(Boolean).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>

        {/* Podium — top 3 */}
        {!collegeFilter && filtered.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {/* 2nd */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center gap-2 pt-6"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-500/10 border-2 border-slate-400/30 flex items-center justify-center overflow-hidden">
                {filtered[1]?.user?.profile?.avatar
                  ? <img src={filtered[1].user.profile.avatar} alt="2nd" className="w-full h-full object-cover" />
                  : <User className="w-7 h-7 text-slate-400" />
                }
              </div>
              <Medal className="w-6 h-6 text-slate-300" />
              <p className="text-xs font-bold text-center truncate w-full px-1 text-slate-300">
                {filtered[1]?.user?.profile?.firstName}
              </p>
              <p className="text-sm font-extrabold text-slate-300">{Math.round(filtered[1]?.accuracy)}%</p>
            </motion.div>
            {/* 1st */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0 }}
              className="flex flex-col items-center gap-2 -mt-2"
            >
              <Crown className="w-6 h-6 text-yellow-400 mb-1" />
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-yellow-500/10 border-2 border-yellow-400/40 flex items-center justify-center overflow-hidden shadow-lg shadow-yellow-500/10">
                {filtered[0]?.user?.profile?.avatar
                  ? <img src={filtered[0].user.profile.avatar} alt="1st" className="w-full h-full object-cover" />
                  : <User className="w-8 h-8 text-yellow-400" />
                }
              </div>
              <p className="text-xs font-bold text-center truncate w-full px-1 text-yellow-400">
                {filtered[0]?.user?.profile?.firstName}
              </p>
              <p className="text-base font-extrabold text-yellow-400">{Math.round(filtered[0]?.accuracy)}%</p>
            </motion.div>
            {/* 3rd */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center gap-2 pt-6"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-900/10 border-2 border-amber-700/30 flex items-center justify-center overflow-hidden">
                {filtered[2]?.user?.profile?.avatar
                  ? <img src={filtered[2].user.profile.avatar} alt="3rd" className="w-full h-full object-cover" />
                  : <User className="w-7 h-7 text-amber-600" />
                }
              </div>
              <Medal className="w-6 h-6 text-amber-600" />
              <p className="text-xs font-bold text-center truncate w-full px-1 text-amber-600">
                {filtered[2]?.user?.profile?.firstName}
              </p>
              <p className="text-sm font-extrabold text-amber-600">{Math.round(filtered[2]?.accuracy)}%</p>
            </motion.div>
          </div>
        )}

        {/* Table */}
        <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/30 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-4 sm:px-6 py-4 text-center w-16">Rank</th>
                <th className="px-4 sm:px-6 py-4">User</th>
                <th className="px-4 sm:px-6 py-4 hidden sm:table-cell">College</th>
                <th className="px-4 sm:px-6 py-4 text-right">Accuracy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-muted-foreground">
                    {collegeFilter ? 'No entries found for this college.' : 'No entries yet this week. Start practicing to climb the leaderboard!'}
                  </td>
                </tr>
              ) : (
                filtered.map((entry, index) => {
                  const isMe = entry.user?._id?.toString() === myUserId?.toString();
                  const rankStyle = RANK_STYLES[index];
                  return (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`transition-colors ${isMe ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-secondary/10'}`}
                    >
                      <td className="px-4 sm:px-6 py-4 text-center">
                        {rankStyle ? (
                          <div className={`w-8 h-8 rounded-full border flex items-center justify-center mx-auto ${rankStyle.bg}`}>
                            {rankStyle.icon}
                          </div>
                        ) : (
                          <span className={`font-bold text-sm ${isMe ? 'text-primary' : 'text-muted-foreground'}`}>
                            {index + 1}
                          </span>
                        )}
                      </td>
                      <td className="px-4 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0 overflow-hidden border border-border">
                            {entry.user?.profile?.avatar ? (
                              <img src={entry.user.profile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className={`font-semibold text-sm truncate ${isMe ? 'text-primary' : 'text-foreground'}`}>
                              {entry.user?.profile?.firstName || 'Anonymous'} {entry.user?.profile?.lastName || ''}
                              {isMe && <span className="ml-1.5 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold">You</span>}
                            </p>
                            <p className="text-xs text-muted-foreground truncate sm:hidden">
                              {entry.user?.profile?.college || '—'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground truncate block max-w-[180px]">
                          {entry.user?.profile?.college || '—'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <span className={`font-bold text-sm ${index === 0 ? 'text-yellow-400' : index < 3 ? 'text-foreground' : 'text-primary'}`}>
                          {Math.round(entry.accuracy)}%
                        </span>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Leaderboard resets every Monday at midnight IST. Scores based on weekly accuracy across all practice sessions.
        </p>
      </div>
    </>
  );
}

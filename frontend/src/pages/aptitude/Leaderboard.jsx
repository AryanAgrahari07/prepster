import { useState, useEffect } from 'react';
import { api } from '@/store/authStore';
import { Trophy, Medal, User } from 'lucide-react';
import SEO from '@/components/seo/SEO';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [week, setWeek] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/aptitude/leaderboard')
      .then(res => {
        setLeaderboard(res.data.data.leaderboard || []);
        setWeek(res.data.data.week || '');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading leaderboard...</div>;

  return (
    <>
    <SEO title="Weekly Leaderboard" description="Top performers based on accuracy this week on Prepster." />
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-2">
          <Trophy className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Weekly Leaderboard</h1>
        <p className="text-muted-foreground">Top performers based on accuracy this week.</p>
        {week && <p className="text-xs text-muted-foreground font-mono">Week: {week}</p>}
      </div>

      <div className="bg-background border border-border rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/30 text-muted-foreground uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium text-center w-16">Rank</th>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium text-right">Accuracy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leaderboard.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center text-muted-foreground">
                  No entries yet this week. Start practicing to climb the leaderboard!
                </td>
              </tr>
            ) : (
              leaderboard.map((entry, index) => (
                <tr key={index} className="hover:bg-secondary/10 transition-colors">
                  <td className="px-6 py-4 text-center">
                    {index === 0 ? <Medal className="w-6 h-6 text-yellow-500 mx-auto" /> :
                     index === 1 ? <Medal className="w-6 h-6 text-gray-400 mx-auto" /> :
                     index === 2 ? <Medal className="w-6 h-6 text-amber-700 mx-auto" /> :
                     <span className="font-bold text-muted-foreground">{index + 1}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                        {entry.user?.profile?.avatar ? (
                          <img src={entry.user.profile.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <User className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="font-semibold text-foreground">
                        {entry.user?.profile?.firstName || 'Anonymous'} {entry.user?.profile?.lastName || ''}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="font-bold text-primary">{Math.round(entry.accuracy)}%</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}

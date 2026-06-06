import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/store/authStore';
import { startSession } from '@/api/aptitude';
import { Button } from '@/components/ui/Button';
import { CalendarDays, Zap, Trophy, Clock } from 'lucide-react';
import toast from '@/utils/toast';

export default function DailyChallenge() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/aptitude/daily-challenge')
      .then(res => {
        setChallenge(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error?.message || 'Failed to load daily challenge');
        setLoading(false);
      });
  }, []);

  const handleStart = async () => {
    try {
      setStarting(true);
      const res = await startSession({ sessionType: 'daily-challenge', limit: 20 });
      // API envelope: { success, data: { sessionId } }
      const sessionId = res.data?.sessionId || res.sessionId;
      navigate(`/aptitude/session/${sessionId}`);
    } catch (err) {
      if (err.response?.data?.error?.code === 4002) {
        navigate('/upgrade');
      } else {
        toast.error(err.response?.data?.error?.message || 'Failed to start challenge');
        setStarting(false);
      }
    }
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const topics = challenge?.questions
    ? [...new Set(challenge.questions.map(q => q.topic))].map(t => t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, ' '))
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
          <CalendarDays className="w-4 h-4" />
          {today}
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Daily Challenge</h1>
        <p className="text-muted-foreground">
          20 fresh questions every day. Test your consistency and build your streak!
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-muted-foreground">Loading today's challenge…</div>
      ) : error ? (
        <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center text-destructive">
          {error}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-secondary/20 border border-border rounded-xl p-5 text-center space-y-2">
              <Zap className="w-6 h-6 text-yellow-400 mx-auto" />
              <p className="text-2xl font-bold">{challenge?.questions?.length || 20}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
            <div className="bg-secondary/20 border border-border rounded-xl p-5 text-center space-y-2">
              <Clock className="w-6 h-6 text-blue-400 mx-auto" />
              <p className="text-2xl font-bold">~20</p>
              <p className="text-xs text-muted-foreground">Minutes</p>
            </div>
            <div className="bg-secondary/20 border border-border rounded-xl p-5 text-center space-y-2">
              <Trophy className="w-6 h-6 text-primary mx-auto" />
              <p className="text-2xl font-bold">Mixed</p>
              <p className="text-xs text-muted-foreground">Difficulty</p>
            </div>
          </div>

          <div className="bg-secondary/10 border border-border rounded-xl p-6 space-y-3">
            <h2 className="font-bold text-lg">📋 Today's Topics</h2>
            <div className="flex flex-wrap gap-2">
              {topics.map(topic => (
                <span key={topic} className="text-xs bg-secondary px-3 py-1.5 rounded-full text-foreground font-medium capitalize">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {challenge?.isCompleted ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-xl text-center space-y-2">
              <h3 className="font-bold text-lg flex items-center justify-center gap-2"><Trophy className="w-5 h-5" /> Challenge Completed!</h3>
              <p className="text-sm">You have successfully completed today's challenge. Come back tomorrow for a new set of questions.</p>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full font-bold text-base h-14"
              onClick={handleStart}
              isLoading={starting}
            >
              <Zap className="w-5 h-5 mr-2" />
              Start Today's Challenge
            </Button>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Questions refresh at midnight IST. Your streak keeps growing as long as you complete at least one session per day.
          </p>
        </>
      )}
    </div>
  );
}

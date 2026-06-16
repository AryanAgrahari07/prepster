import { useState, useEffect, useRef } from 'react';
import { getWatTopics, startMbaSession, finishMbaSession } from '@/api/mba';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Loader2, ArrowRight, Save, Clock, PenTool } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { motion } from 'framer-motion';
import toast from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

export default function WatPractice() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState(null);
  const [session, setSession] = useState(null);
  const [essay, setEssay] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const timerRef = useRef(null);
  
  const wordCount = essay.trim().split(/\s+/).filter(w => w.length > 0).length;

  useEffect(() => {
    getWatTopics()
      .then(res => {
        setTopics(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleFinish(true); // Auto-submit when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [timeLeft]);

  const handleStartPractice = async (topic) => {
    if (!user) {
      toast.error('Please sign in to start a timed WAT session.');
      navigate('/auth/register');
      return;
    }
    setActiveTopic(topic);
    setEssay('');
    setSession(null);
    setTimeLeft(topic.timeLimitMinutes * 60);
    
    try {
      const res = await startMbaSession({ sessionType: 'wat', watTopicId: topic._id });
      setSession(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinish = async (autoSubmit = false) => {
    if (!session) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    
    try {
      await finishMbaSession(session._id, { 
        submission: essay,
        timeTakenSeconds: (activeTopic.timeLimitMinutes * 60) - timeLeft
      });
      toast.success(autoSubmit ? 'Time is up! Your essay has been submitted.' : 'WAT essay submitted successfully!');
      setActiveTopic(null);
      setSession(null);
      setTimeLeft(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save your essay. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />Loading WAT Topics...</div>;

  return (
    <div className="space-y-8">
      <SEO title="WAT Practice | Prepster" description="Written Ability Test preparation for MBA interviews." />
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">WAT Practice</h1>
        <p className="text-muted-foreground mt-1">Practice timed essay writing for IIM interviews and XAT.</p>
      </div>

      {!activeTopic ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {topics.length === 0 ? (
            <div className="col-span-full text-center p-12 app-card text-muted-foreground">
              No WAT topics found.
            </div>
          ) : topics.map((t) => (
            <div key={t._id} className="app-card p-6 flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-4 mb-4">
                <span className="flex items-center gap-1.5 text-xs font-bold bg-secondary px-3 py-1.5 rounded-full text-secondary-foreground">
                  <Clock className="w-3.5 h-3.5" /> {t.timeLimitMinutes} mins
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold bg-secondary px-3 py-1.5 rounded-full text-secondary-foreground">
                  <PenTool className="w-3.5 h-3.5" /> {t.wordLimit} words
                </span>
              </div>
              <h3 className="font-bold text-lg mb-6 flex-1">"{t.prompt}"</h3>
              
              <Button onClick={() => handleStartPractice(t)} className="w-full">
                Start Timed Session <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Button variant="outline" onClick={() => { clearInterval(timerRef.current); setActiveTopic(null); }}>← Abandon Session</Button>
            <div className="flex items-center gap-4 bg-background border border-border px-4 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <Clock className={`w-5 h-5 ${timeLeft < 120 ? 'text-red-500 animate-pulse' : 'text-primary'}`} />
                <span className={`font-mono text-xl font-bold ${timeLeft < 120 ? 'text-red-500' : ''}`}>
                  {timeLeft !== null ? formatTime(timeLeft) : '00:00'}
                </span>
              </div>
              <div className="w-px h-6 bg-border"></div>
              <div className={`text-sm font-semibold ${wordCount > activeTopic.wordLimit ? 'text-red-500' : 'text-muted-foreground'}`}>
                {wordCount} / {activeTopic.wordLimit} words
              </div>
            </div>
          </div>
          
          <div className="app-card p-0 overflow-hidden border-2 focus-within:border-primary/50 transition-colors">
            <div className="bg-secondary/30 p-6 border-b border-border">
              <h2 className="text-xl font-bold text-center leading-relaxed">"{activeTopic.prompt}"</h2>
            </div>
            
            <textarea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              className="w-full h-[50vh] min-h-[300px] bg-background p-6 text-base leading-relaxed focus:outline-none resize-y"
              placeholder="Start typing your essay here..."
              spellCheck="false"
            />
            
            <div className="bg-secondary/20 p-4 border-t border-border flex justify-end">
              <Button onClick={() => handleFinish(false)} disabled={submitting} className="bg-green-500 hover:bg-green-600 text-white">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                Submit Essay
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getGdTopics, startMbaSession, finishMbaSession } from '@/api/mba';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Users, Star, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import toast from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

export default function GdPracticeHub() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTopic, setActiveTopic] = useState(null);
  const [session, setSession] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getGdTopics()
      .then(res => {
        setTopics(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStartPractice = async (topic) => {
    if (!user) {
      toast.error('Please sign in to start a practice session.');
      navigate('/auth/register');
      return;
    }
    setActiveTopic(topic);
    setNotes('');
    setSession(null);
    try {
      const res = await startMbaSession({ sessionType: 'gd', gdTopicId: topic._id });
      setSession(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinish = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      await finishMbaSession(session._id, { submission: notes });
      setActiveTopic(null);
      setSession(null);
      toast.success('GD session saved! Great work.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save session. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />Loading GD Topics...</div>;

  return (
    <div className="space-y-8">
      <SEO title="Group Discussion Prep | Prepster" description="Practice GD topics for MBA placements." />
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Group Discussion Hub</h1>
        <p className="text-muted-foreground mt-1">Master group dynamics with curated topics and structured arguments.</p>
      </div>

      {!activeTopic ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.length === 0 ? (
            <div className="col-span-full text-center p-12 app-card text-muted-foreground">
              No GD topics found. Please run the seeder script.
            </div>
          ) : topics.map((topic) => (
            <div key={topic._id} className="app-card p-6 flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-2 py-1 rounded">
                  {topic.category}
                </span>
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded ${
                  topic.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                  topic.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {topic.difficulty}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{topic.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-1">{topic.background}</p>
              
              <Button onClick={() => handleStartPractice(topic)} className="w-full">
                Practice This Topic <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Button variant="outline" onClick={() => setActiveTopic(null)}>← Back to Topics</Button>
          
          <div className="app-card p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-4">{activeTopic.title}</h2>
            <div className="bg-secondary/30 p-4 rounded-xl mb-6 text-sm leading-relaxed border border-border">
              <strong>Background:</strong> {activeTopic.background}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-3">
                <h3 className="font-semibold text-green-500 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Arguments For</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {activeTopic.forArguments?.map((arg, i) => (
                    <li key={i} className="pl-4 border-l-2 border-green-500/30">{arg}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-red-500 flex items-center gap-2"><CheckCircle2 className="w-4 h-4"/> Arguments Against</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {activeTopic.againstArguments?.map((arg, i) => (
                    <li key={i} className="pl-4 border-l-2 border-red-500/30">{arg}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-bold mb-4">Self-Evaluation Notes</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Jot down your unique points, stats you can quote, or structure for your opening statement.
              </p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 bg-background border border-input rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Type your notes here..."
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={handleFinish} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                  Save Session
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

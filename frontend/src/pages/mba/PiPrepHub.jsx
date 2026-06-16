import { useState, useEffect } from 'react';
import { getPiQuestions, startMbaSession, finishMbaSession } from '@/api/mba';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Target, Loader2, ArrowRight, Save, Eye, EyeOff } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { motion } from 'framer-motion';
import toast from '@/utils/toast';
import { useNavigate } from 'react-router-dom';

export default function PiPrepHub() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [session, setSession] = useState(null);
  const [notes, setNotes] = useState('');
  const [showSample, setShowSample] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getPiQuestions()
      .then(res => {
        setQuestions(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStartPractice = async (q) => {
    if (!user) {
      toast.error('Please sign in to start a practice session.');
      navigate('/auth/register');
      return;
    }
    setActiveQuestion(q);
    setNotes('');
    setShowSample(false);
    setSession(null);
    try {
      const res = await startMbaSession({ sessionType: 'pi', piQuestionId: q._id });
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
      setActiveQuestion(null);
      setSession(null);
      toast.success('PI answer saved! Keep practising.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />Loading PI Questions...</div>;

  return (
    <div className="space-y-8">
      <SEO title="Personal Interview Prep | Prepster" description="Practice HR and behavioral questions with the STAR framework." />
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">PI Preparation Hub</h1>
        <p className="text-muted-foreground mt-1">Nail your HR and behavioral rounds using the STAR framework.</p>
      </div>

      {!activeQuestion ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.length === 0 ? (
            <div className="col-span-full text-center p-12 app-card text-muted-foreground">
              No PI questions found.
            </div>
          ) : questions.map((q) => (
            <div key={q._id} className="app-card p-6 flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-500/10 text-blue-500 px-2 py-1 rounded">
                  {q.type}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-4 flex-1">{q.question}</h3>
              
              <Button onClick={() => handleStartPractice(q)} className="w-full">
                Draft Answer <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Button variant="outline" onClick={() => setActiveQuestion(null)}>← Back to Questions</Button>
          
          <div className="app-card p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-primary">{activeQuestion.question}</h2>

            {/* STAR Framework guidance */}
            {activeQuestion.starFramework && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-secondary/20 rounded-xl border border-border">
                  <h4 className="font-bold text-sm mb-1 text-orange-500">Situation</h4>
                  <p className="text-xs text-muted-foreground">{activeQuestion.starFramework.situation || 'Set the scene and give the necessary details of your example.'}</p>
                </div>
                <div className="p-4 bg-secondary/20 rounded-xl border border-border">
                  <h4 className="font-bold text-sm mb-1 text-blue-500">Task</h4>
                  <p className="text-xs text-muted-foreground">{activeQuestion.starFramework.task || 'Describe what your responsibility was in that situation.'}</p>
                </div>
                <div className="p-4 bg-secondary/20 rounded-xl border border-border">
                  <h4 className="font-bold text-sm mb-1 text-green-500">Action</h4>
                  <p className="text-xs text-muted-foreground">{activeQuestion.starFramework.action || 'Explain exactly what steps you took to address it.'}</p>
                </div>
                <div className="p-4 bg-secondary/20 rounded-xl border border-border">
                  <h4 className="font-bold text-sm mb-1 text-purple-500">Result</h4>
                  <p className="text-xs text-muted-foreground">{activeQuestion.starFramework.result || 'Share what outcomes your actions achieved.'}</p>
                </div>
              </div>
            )}

            <div className="border-t border-border pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">Your Draft Answer</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSample(!showSample)}>
                  {showSample ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                  {showSample ? 'Hide Sample' : 'View Sample Answer'}
                </Button>
              </div>

              {showSample && activeQuestion.sampleAnswer && (
                <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl text-sm italic">
                  <span className="font-bold block mb-1">Sample Answer:</span>
                  {activeQuestion.sampleAnswer}
                </div>
              )}

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-40 bg-background border border-input rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Type your STAR method answer here..."
              />
              <div className="mt-4 flex justify-end">
                <Button onClick={handleFinish} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Answer
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCaseStudies, startMbaSession, finishMbaSession, getCaseStudyById } from '@/api/mba';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Briefcase, Loader2, Lock, ArrowRight, BookOpen, Star, FileText } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { motion } from 'framer-motion';
import toast from '@/utils/toast';
import { Link, useNavigate } from 'react-router-dom';

export default function CaseStudyLibrary() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCase, setActiveCase] = useState(null);
  const [session, setSession] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCaseStudies()
      .then(res => {
        setCases(res.data.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const isPro = user?.subscription?.plan === 'pro';

  const handleStartCase = async (caseId) => {
    if (!user) {
      toast.error('Please sign in to start a case study session.');
      navigate('/auth/register');
      return;
    }
    try {
      const caseRes = await getCaseStudyById(caseId);
      setActiveCase(caseRes.data.data);
      setNotes('');
      setSession(null);
      
      const sessionRes = await startMbaSession({ sessionType: 'case', caseStudyId: caseId });
      setSession(sessionRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load case study. Please try again.');
    }
  };

  const handleFinish = async () => {
    if (!session) return;
    setSubmitting(true);
    try {
      await finishMbaSession(session._id, { submission: notes });
      setActiveCase(null);
      setSession(null);
      toast.success('Case notes saved! Keep solving.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save notes. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />Loading Case Studies...</div>;

  return (
    <div className="space-y-8">
      <SEO title="Case Study Library | Prepster" description="Solve business case studies for consulting and product management." />
      
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Case Study Library</h1>
        <p className="text-muted-foreground mt-1">Master consulting frameworks, profitability, and market-entry cases.</p>
      </div>

      {!activeCase ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cases.length === 0 ? (
            <div className="col-span-full text-center p-12 app-card text-muted-foreground">
              No case studies found.
            </div>
          ) : cases.map((c) => (
            <div key={c._id} className="app-card p-6 flex flex-col hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-green-500/10 text-green-500 px-2 py-1 rounded">
                    {c.sector}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-bold bg-secondary text-secondary-foreground px-2 py-1 rounded">
                    {c.type}
                  </span>
                </div>
                {!c.isFree && !isPro && <Lock className="w-4 h-4 text-muted-foreground" />}
              </div>
              <h3 className="font-bold text-lg mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-6 flex-1">{c.description}</p>
              
              <Button onClick={() => handleStartCase(c._id)} className="w-full" variant={!c.isFree && !isPro ? "outline" : "default"}>
                {!c.isFree && !isPro ? 'Preview Case' : 'Solve Case'} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Button variant="outline" onClick={() => setActiveCase(null)}>← Back to Library</Button>
          
          <div className="app-card p-6 md:p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">{activeCase.title}</h2>
              <span className="text-[10px] uppercase tracking-wider font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                {activeCase.difficulty}
              </span>
            </div>
            
            <div className="bg-secondary/30 p-5 rounded-xl mb-8 text-sm leading-relaxed border border-border">
              <h3 className="font-bold mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4"/> The Prompt</h3>
              {activeCase.description}
            </div>

            {activeCase.isLocked ? (
              <div className="text-center p-8 bg-gradient-to-b from-transparent to-primary/5 border border-primary/20 rounded-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-0"></div>
                <div className="relative z-10 flex flex-col items-center">
                  <Lock className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-xl font-bold mb-2">Solution Locked</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    You're viewing a Pro-tier case study. Upgrade to Prepster Pro to see the structured approach and the detailed solution.
                  </p>
                  <Link to="/upgrade">
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold">
                      Upgrade to Unlock
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><FileText className="w-4 h-4"/> Structured Approach</h3>
                  <div className="space-y-3">
                    {activeCase.structuredApproach?.map((step, i) => (
                      <div key={i} className="flex gap-4 p-4 border border-border rounded-lg bg-background">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{step.step}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{step.details}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-xl">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-primary"><BookOpen className="w-4 h-4"/> Solution / Synthesis</h3>
                  <p className="text-sm leading-relaxed text-card-foreground whitespace-pre-wrap">{activeCase.solution}</p>
                </div>

                <div className="border-t border-border pt-6">
                  <h3 className="font-bold mb-2">Your Case Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full h-32 bg-background border border-input rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Scratchpad for your calculations, framework trees, and synthesis..."
                  />
                  <div className="mt-4 flex justify-end">
                    <Button onClick={handleFinish} disabled={submitting}>
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Star className="w-4 h-4 mr-2" />}
                      Save Notes
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

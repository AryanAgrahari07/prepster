import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCompanyTrack, getCompanyMockTests, getCompanyProgress, startCompanyMockTest, getCompanyQuestions } from '@/api/company';
import { Button } from '@/components/ui/Button';
import { Building2, ArrowLeft, Target, GraduationCap, Briefcase, PlayCircle, Clock, Zap, CheckCircle2, Lock, MessageSquare } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from '@/utils/toast';
import SEO from '@/components/seo/SEO';

export default function CompanyTrack() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [mockTests, setMockTests] = useState([]);
  const [progress, setProgress] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [starting, setStarting] = useState(null); // stores mockId being started

  useEffect(() => {
    Promise.all([
      getCompanyTrack(slug).catch(() => null),
      getCompanyMockTests(slug).catch(() => ({ data: { mockTests: [] } })),
      getCompanyProgress(slug).catch(() => ({ data: null })),
      user?.subscription?.plan === 'pro' ? getCompanyQuestions(slug, 5).catch(() => ({ data: { questions: [] } })) : Promise.resolve({ data: { questions: [] } })
    ]).then(([trackRes, mocksRes, progRes, questionsRes]) => {
      if (!trackRes) return navigate('/companies');
      setData(trackRes.data);
      setMockTests(mocksRes?.data?.mockTests || []);
      setProgress(progRes?.data || null);
      setQuestions(questionsRes?.data?.questions || []);
      setLoading(false);
    });
  }, [slug, navigate]);

  const handleStartMock = async (mockId) => {
    if (!user) {
      toast.error('Please log in to take mock tests');
      return navigate('/auth/login');
    }

    if (user?.subscription?.plan === 'free') {
      toast.error('Company mock tests are available for Pro users only. Please upgrade.');
      return navigate('/upgrade');
    }
    
    try {
      setStarting(mockId);
      const res = await startCompanyMockTest(slug, mockId);
      navigate(`/aptitude/session/${res.data.sessionId}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to start mock test');
      setStarting(null);
    }
  };

  const handleLoadMore = async () => {
    try {
      setLoadingMore(true);
      const res = await getCompanyQuestions(slug, questions.length + 10);
      setQuestions(res.data?.questions || []);
      setLoadingMore(false);
    } catch (err) {
      toast.error('Failed to load more questions');
      setLoadingMore(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto p-8 space-y-6 animate-pulse">
      <div className="h-24 bg-secondary/30 rounded-2xl"></div>
      <div className="h-64 bg-secondary/20 rounded-xl"></div>
    </div>
  );
  
  if (!data) return null;

  const { company, totalQuestions } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <SEO 
        title={`${company.name} Placement Preparation & Mock Tests | Prepster`} 
        description={`Master the ${company.name} hiring process. Access previous year placement papers, round-by-round interview guides, and specific mock tests.`}
        keywords={`${company.name} NQT, ${company.name} mock test, ${company.name} recruitment process, ${company.name} placement papers, ${company.name} interview questions`}
        url={`https://prepster.in/companies/${slug}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Companies",
            "item": "https://prepster.in/companies"
          },{
            "@type": "ListItem",
            "position": 2,
            "name": company.name,
            "item": `https://prepster.in/companies/${slug}`
          }]
        }}
      />
      <Link to="/companies" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Companies
      </Link>

      {/* Header Section */}
      <div className="flex flex-col gap-4 items-start bg-secondary/10 p-4 sm:p-6 md:p-8 rounded-3xl border border-border/50 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        
        <div className="flex items-center gap-4 w-full z-10">
          <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center shrink-0">
            {company.logo ? (
              <img src={company.logo} alt={company.name} className="w-10 h-10 sm:w-16 sm:h-16 object-contain" />
            ) : (
              <Building2 className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground">{company.name}</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-lg">{company.sector} Preparation Track</p>
          </div>
        </div>
        
        {progress && (
          <div className="flex items-center gap-4 sm:gap-6 z-10 flex-wrap">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Readiness Score</span>
              <span className={`text-xl sm:text-2xl font-bold ${progress.readinessScore > 70 ? 'text-green-500' : progress.readinessScore > 40 ? 'text-yellow-500' : 'text-primary'}`}>
                {progress.readinessScore}%
              </span>
            </div>
            <div className="h-8 w-px bg-border"></div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Mocks Completed</span>
              <span className="text-xl sm:text-2xl font-bold text-foreground">
                {progress.completedSessions}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 p-5 sm:p-6 rounded-2xl hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2 text-green-500">
            <Target className="w-5 h-5" />
            <h3 className="font-semibold">Question Bank</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{totalQuestions}</p>
          <p className="text-sm text-muted-foreground mt-1">Targeted questions available</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 p-5 sm:p-6 rounded-2xl hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2 text-blue-500">
            <Briefcase className="w-5 h-5" />
            <h3 className="font-semibold">Fresher CTC</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{company.packageInfo?.fresher || 'N/A'}</p>
          <p className="text-sm text-muted-foreground mt-1">Starting package</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 p-5 sm:p-6 rounded-2xl hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-3 mb-2 text-yellow-500">
            <GraduationCap className="w-5 h-5" />
            <h3 className="font-semibold">Min. CGPA</h3>
          </div>
          <p className="text-3xl font-bold text-foreground">{company.selectionCriteria?.minCGPA || '6.0'}</p>
          <p className="text-sm text-muted-foreground mt-1">Required to apply</p>
        </div>
      </div>

      {/* Mock Tests Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Available Mock Tests</h2>
          {user?.subscription?.plan === 'free' && (
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">PRO ONLY</span>
          )}
        </div>
        
        {mockTests.length === 0 ? (
          <div className="bg-secondary/20 border border-border p-8 rounded-2xl text-center text-muted-foreground">
            No mock tests configured for {company.name} yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {mockTests.map(mock => (
              <div key={mock.id} className="bg-background border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-primary/10 text-primary rounded-xl group-hover:scale-110 transition-transform">
                    {mock.type === 'quick' ? <Zap className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">
                    {mock.type === 'quick' ? 'Quick Prep' : 'Full Length'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">{mock.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6 flex-1">{mock.description}</p>
                
                <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground mb-6">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {mock.durationMinutes} mins</span>
                  <span className="flex items-center gap-1.5"><Target className="w-4 h-4" /> {mock.questionCount} Qs</span>
                </div>
                
                <Button 
                  onClick={() => handleStartMock(mock.id)} 
                  isLoading={starting === mock.id}
                  disabled={starting !== null && starting !== mock.id}
                  className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-all font-semibold"
                >
                  Start {mock.type === 'quick' ? 'Practice' : 'Mock Test'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-primary" />
            Hiring Process
          </h2>
          <div className="bg-secondary/10 border border-border p-8 rounded-2xl">
            <p className="text-muted-foreground mb-8 leading-relaxed text-sm">{company.hiringProcess?.overview || 'Hiring process details not available.'}</p>
            
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-border before:to-transparent">
              {company.hiringProcess?.rounds?.map((round, idx) => (
                <div key={idx} className="relative flex items-start gap-5">
                  <div className="w-9 h-9 rounded-full bg-background border-2 border-primary flex items-center justify-center shrink-0 font-bold text-primary shadow-sm z-10 text-sm">
                    {idx + 1}
                  </div>
                  <div className="bg-background border border-border p-5 rounded-xl flex-1 shadow-sm hover:border-primary/30 transition-colors">
                    <h4 className="font-bold text-foreground text-sm">{round.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{round.description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="text-[10px] uppercase font-bold bg-secondary px-2 py-1 rounded text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {round.duration}
                      </span>
                      <span className="text-[10px] uppercase font-bold bg-secondary px-2 py-1 rounded text-muted-foreground flex items-center gap-1">
                        <Target className="w-3 h-3" /> {round.questionsCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Eligibility Criteria</h2>
          <div className="bg-secondary/10 border border-border p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center bg-background border border-border/50 p-4 rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">10th & 12th Marks</span>
              <span className="font-bold text-foreground">{company.selectionCriteria?.tenthPercent || '60'}%+</span>
            </div>
            <div className="flex justify-between items-center bg-background border border-border/50 p-4 rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">Active Backlogs</span>
              <span className="font-bold text-foreground">{company.selectionCriteria?.backlogs || 'Not specified'}</span>
            </div>
            <div className="flex justify-between items-center bg-background border border-border/50 p-4 rounded-xl">
              <span className="text-sm font-medium text-muted-foreground">Eligible Batches</span>
              <span className="font-bold text-foreground bg-primary/10 text-primary px-3 py-1 rounded-lg">
                {company.selectionCriteria?.batchYears?.join(', ') || 'Any'}
              </span>
            </div>
            <div className="bg-background border border-border/50 p-5 rounded-xl mt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-3">Allowed Branches</span>
              <div className="flex flex-wrap gap-2">
                {company.selectionCriteria?.branches?.map(b => (
                  <span key={b} className="text-xs border border-border bg-secondary/50 px-2.5 py-1.5 rounded-md font-medium text-foreground">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Bank Section */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Company Question Bank</h2>
          {user?.subscription?.plan === 'free' && (
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">PRO ONLY</span>
          )}
        </div>
        
        {user?.subscription?.plan === 'free' ? (
          <div className="bg-secondary/10 border border-border p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg">Unlock Question Bank</h3>
            <p className="text-muted-foreground max-w-md">Get access to {totalQuestions}+ previously asked questions from {company.name} placement drives.</p>
            <Link to="/upgrade">
              <Button>Upgrade to Pro</Button>
            </Link>
          </div>
        ) : questions.length === 0 ? (
          <div className="bg-secondary/20 border border-border p-8 rounded-2xl text-center text-muted-foreground">
            No questions available for {company.name} yet.
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, idx) => (
              <div key={q._id} className="bg-background border border-border rounded-xl p-5 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                    Q{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{q.text}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {q.options?.map((opt) => (
                        <span key={opt.label} className="text-sm bg-secondary px-3 py-1.5 rounded-md border border-border/50 text-muted-foreground">
                          {opt.label}. {opt.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center pt-4">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto" 
                onClick={handleLoadMore}
                isLoading={loadingMore}
                disabled={questions.length >= totalQuestions}
              >
                {questions.length >= totalQuestions ? 'All Questions Loaded' : 'Load More Questions'}
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Interview Experiences Section */}
      {company.interviewExperiences && company.interviewExperiences.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-border">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              Interview Experiences
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {company.interviewExperiences.map((exp, idx) => (
              <div key={idx} className="bg-background border border-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col group">
                <h3 className="text-lg font-bold text-foreground mb-3">{exp.title}</h3>
                <div className="relative">
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                    {exp.content}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
                </div>
                
                <div className="mt-4 pt-4 border-t border-border/50 flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">
                    {new Date(exp.dateScraped || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  {exp.sourceUrl && (
                    <a href={exp.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-primary hover:underline">
                      Read Full Experience &rarr;
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCompanyTrack, getCompanyMockTests, getCompanyProgress, startCompanyMockTest, getCompanyQuestions, getCompanyQuestionsPreview } from '@/api/company';
import { Button } from '@/components/ui/Button';
import { Building2, ArrowLeft, Target, GraduationCap, Briefcase, PlayCircle, Clock, Zap, CheckCircle2, Lock, MessageSquare, ChevronRight } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import toast from '@/utils/toast';
import SEO from '@/components/seo/SEO';
import SubmitExperienceModal from './SubmitExperienceModal';

export default function CompanyTrack() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [mockTests, setMockTests] = useState([]);
  const [progress, setProgress] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [previewQuestions, setPreviewQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [starting, setStarting] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTrack = () => {
    getCompanyTrack(slug).then(res => setData(res.data)).catch(() => null);
  };

  useEffect(() => {
    Promise.all([
      getCompanyTrack(slug).catch(() => null),
      getCompanyMockTests(slug).catch(() => ({ data: { mockTests: [] } })),
      getCompanyProgress(slug).catch(() => ({ data: null })),
      user?.subscription?.plan === 'pro'
        ? getCompanyQuestions(slug, 10).catch(() => ({ data: { questions: [] } }))
        : Promise.resolve({ data: { questions: [] } }),
      getCompanyQuestionsPreview(slug).catch(() => ({ data: { questions: [] } })),
    ]).then(([trackRes, mocksRes, progRes, questionsRes, previewRes]) => {
      if (!trackRes) return navigate('/companies');
      setData(trackRes.data);
      setMockTests(mocksRes?.data?.mockTests || []);
      setProgress(progRes?.data || null);
      setQuestions(questionsRes?.data?.questions || []);
      setPreviewQuestions(previewRes?.data?.questions || []);
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
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-6 w-32 bg-secondary/30 rounded-lg" />
      <div className="h-32 bg-secondary/30 rounded-2xl" />
      <div className="grid grid-cols-3 gap-3">
        <div className="h-24 bg-secondary/20 rounded-xl" />
        <div className="h-24 bg-secondary/20 rounded-xl" />
        <div className="h-24 bg-secondary/20 rounded-xl" />
      </div>
      <div className="h-64 bg-secondary/20 rounded-xl" />
    </div>
  );

  if (!data) return null;

  const { company, totalQuestions } = data;

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12 px-3 sm:px-4 md:px-6">
      <SEO
        title={`${company.name} Placement Preparation & Mock Tests | Prepster`}
        description={`Master the ${company.name} hiring process. Access previous year placement papers, round-by-round interview guides, and specific mock tests.`}
        keywords={`${company.name} NQT, ${company.name} mock test, ${company.name} recruitment process, ${company.name} placement papers, ${company.name} interview questions`}
        url={`https://prepster.in/companies/${slug}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem", "position": 1, "name": "Companies", "item": "https://prepster.in/companies"
          }, {
            "@type": "ListItem", "position": 2, "name": company.name, "item": `https://prepster.in/companies/${slug}`
          }]
        }}
      />

      {/* Back link */}
      <Link to="/companies" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Companies
      </Link>

      {/* ── Hero Header ──────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 bg-secondary/10 p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-border/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        {/* Logo + Name */}
        <div className="flex items-center gap-3 sm:gap-4 w-full z-10">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center shrink-0">
            {company.logo
              ? <img src={company.logo} alt={company.name} className="w-9 h-9 sm:w-14 sm:h-14 object-contain" />
              : <Building2 className="w-7 h-7 sm:w-10 sm:h-10 text-primary" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold tracking-tight text-foreground truncate">{company.name}</h1>
            <p className="text-muted-foreground mt-0.5 text-xs sm:text-base">{company.sector} Preparation Track</p>
          </div>
        </div>

        {/* Progress stats */}
        {progress && (
          <div className="flex items-center gap-4 sm:gap-6 z-10 flex-wrap">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold tracking-wider">Readiness Score</span>
              <span className={`text-xl sm:text-2xl font-bold ${progress.readinessScore > 70 ? 'text-green-500' : progress.readinessScore > 40 ? 'text-yellow-500' : 'text-primary'}`}>
                {progress.readinessScore}%
              </span>
            </div>
            <div className="h-8 w-px bg-border" />
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs text-muted-foreground uppercase font-semibold tracking-wider">Mocks Done</span>
              <span className="text-xl sm:text-2xl font-bold text-foreground">{progress.completedSessions}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border border-blue-500/20 p-3 sm:p-5 rounded-xl sm:rounded-2xl hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 text-blue-500">
            <Briefcase className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
            <h3 className="font-semibold text-[11px] sm:text-sm truncate">CTC</h3>
          </div>
          <p className="text-sm sm:text-3xl font-bold text-foreground leading-tight">{company.packageInfo?.fresher || 'N/A'}</p>
          <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">Starting package</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/5 border border-yellow-500/20 p-3 sm:p-5 rounded-xl sm:rounded-2xl hover:scale-[1.02] transition-transform">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 text-yellow-500">
            <GraduationCap className="w-3.5 h-3.5 sm:w-5 sm:h-5 shrink-0" />
            <h3 className="font-semibold text-[11px] sm:text-sm truncate">Min. CGPA</h3>
          </div>
          <p className="text-xl sm:text-3xl font-bold text-foreground">{company.selectionCriteria?.minCGPA || '6.0'}</p>
          <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">Required to apply</p>
        </div>
      </div>

      {/* ── Mock Tests ───────────────────────────────────────────── */}
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-lg sm:text-2xl font-bold">Available Mock Tests</h2>
          {user?.subscription?.plan === 'free' && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold border border-primary/20">PRO ONLY</span>
          )}
        </div>

        {mockTests.length === 0 ? (
          <div className="bg-secondary/20 border border-border p-6 sm:p-8 rounded-xl sm:rounded-2xl text-center text-muted-foreground text-sm">
            No mock tests configured for {company.name} yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            {mockTests.map(mock => (
              <div key={mock.id} className="bg-background border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col group">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className="p-2 sm:p-2.5 bg-primary/10 text-primary rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform">
                    {mock.type === 'quick' ? <Zap className="w-4 h-4 sm:w-6 sm:h-6" /> : <PlayCircle className="w-4 h-4 sm:w-6 sm:h-6" />}
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-secondary text-muted-foreground">
                    {mock.type === 'quick' ? 'Quick Prep' : 'Full Length'}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground">{mock.name}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 mb-4 sm:mb-6 flex-1">{mock.description}</p>
                <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-medium text-muted-foreground mb-4 sm:mb-6">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {mock.durationMinutes} mins</span>
                  <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5" /> {mock.questionCount} Qs</span>
                </div>
                <Button
                  onClick={() => handleStartMock(mock.id)}
                  isLoading={starting === mock.id}
                  disabled={starting !== null && starting !== mock.id}
                  className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20 transition-all font-semibold text-sm"
                >
                  Start {mock.type === 'quick' ? 'Practice' : 'Mock Test'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Hiring Process + Eligibility ─────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 pt-2">
        {/* Hiring Process */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
            Hiring Process
          </h2>
          <div className="bg-secondary/10 border border-border p-4 sm:p-8 rounded-xl sm:rounded-2xl">
            <p className="text-muted-foreground mb-5 sm:mb-8 leading-relaxed text-xs sm:text-sm">
              {company.hiringProcess?.overview || 'Hiring process details not available.'}
            </p>
            <div className="space-y-5 sm:space-y-8 relative before:absolute before:inset-0 before:ml-[1.125rem] before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-border before:to-transparent">
              {company.hiringProcess?.rounds?.map((round, idx) => (
                <div key={idx} className="relative flex items-start gap-3 sm:gap-5">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-background border-2 border-primary flex items-center justify-center shrink-0 font-bold text-primary shadow-sm z-10 text-xs sm:text-sm">
                    {idx + 1}
                  </div>
                  <div className="bg-background border border-border p-3 sm:p-5 rounded-lg sm:rounded-xl flex-1 shadow-sm hover:border-primary/30 transition-colors">
                    <h4 className="font-bold text-foreground text-xs sm:text-sm">{round.name}</h4>
                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-1 sm:mt-1.5 leading-relaxed">{round.description}</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-4">
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold bg-secondary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {round.duration}
                      </span>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold bg-secondary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-muted-foreground flex items-center gap-1">
                        <Target className="w-2.5 h-2.5" /> {round.questionsCount}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Eligibility */}
        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-lg sm:text-2xl font-bold">Eligibility Criteria</h2>
          <div className="bg-secondary/10 border border-border p-4 sm:p-6 rounded-xl sm:rounded-2xl space-y-2.5 sm:space-y-4">
            {[
              { label: '10th & 12th Marks', value: `${company.selectionCriteria?.tenthPercent || '60'}%+` },
              { label: 'Active Backlogs', value: company.selectionCriteria?.backlogs || 'Not specified' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center bg-background border border-border/50 p-3 sm:p-4 rounded-lg sm:rounded-xl gap-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</span>
                <span className="font-bold text-foreground text-xs sm:text-sm text-right">{value}</span>
              </div>
            ))}
            <div className="flex justify-between items-center bg-background border border-border/50 p-3 sm:p-4 rounded-lg sm:rounded-xl gap-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">Eligible Batches</span>
              <span className="font-bold text-foreground bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-md text-xs sm:text-sm">
                {company.selectionCriteria?.batchYears?.join(', ') || 'Any'}
              </span>
            </div>
            <div className="bg-background border border-border/50 p-3 sm:p-5 rounded-lg sm:rounded-xl">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-2 sm:mb-3">Allowed Branches</span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {company.selectionCriteria?.branches?.map(b => (
                  <span key={b} className="text-[10px] sm:text-xs border border-border bg-secondary/50 px-2 py-1 rounded-md font-medium text-foreground">
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Question Bank ─────────────────────────────────────────── */}
      <div className="space-y-4 sm:space-y-6 pt-2 sm:pt-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <h2 className="text-lg sm:text-2xl font-bold">Company Question Bank</h2>
          {user?.subscription?.plan === 'free' && (
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold border border-primary/20">PRO FULL ACCESS</span>
          )}
        </div>

        {/* Show Pro questions if user is Pro */}
        {user?.subscription?.plan === 'pro' ? (
          questions.length === 0 ? (
            <div className="bg-secondary/20 border border-border p-6 sm:p-8 rounded-xl sm:rounded-2xl text-center text-muted-foreground text-sm">
              No questions available for {company.name} yet.
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {questions.map((q, idx) => (
                <div key={q._id} className="bg-background border border-border rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 mt-0.5">
                      Q{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm sm:text-base">{q.text}</p>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                        {q.options?.map((opt) => (
                          <span key={opt.label} className="text-xs sm:text-sm bg-secondary px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-border/50 text-muted-foreground">
                            {opt.label}. {opt.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2 sm:pt-4">
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
          )
        ) : (
          /* Free users: show 3 blurred preview questions + upgrade CTA */
          <div className="space-y-3 sm:space-y-4">
            {previewQuestions.length > 0 && previewQuestions.map((q, idx) => (
              <div key={q._id} className="relative overflow-hidden bg-background border border-border rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 mt-0.5">
                    Q{idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base">{q.text}</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2 sm:mt-3 select-none">
                      {q.options?.map((opt) => (
                        <span key={opt.label} className="text-xs sm:text-sm bg-secondary px-2 sm:px-3 py-1 sm:py-1.5 rounded-md border border-border/50 text-muted-foreground">
                          {opt.label}. {opt.text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Blur overlay on last preview card */}
                {idx === previewQuestions.length - 1 && (
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background flex items-end justify-center pb-3" />
                )}
              </div>
            ))}

            {/* Upgrade CTA */}
            <div className="relative bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/30 p-6 sm:p-8 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4 mt-2">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 border border-primary/30 rounded-full flex items-center justify-center text-primary">
                <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg">Unlock Full Question Bank</h3>
                <p className="text-muted-foreground max-w-sm text-xs sm:text-sm mt-1">
                  Access all {company.name} previous year questions with answers, explanations, and full mock tests.
                </p>
              </div>
              <Link to="/upgrade">
                <Button className="text-sm px-6">
                  Upgrade to Pro — ₹799/year
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ── Interview Experiences ─────────────────────────────────── */}
      {company.interviewExperiences !== undefined && (
        <div className="space-y-4 sm:space-y-6 pt-4 sm:pt-6 border-t border-border">
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            <h2 className="text-lg sm:text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary shrink-0" />
              Interview Experiences
            </h2>
            <Button size="sm" onClick={() => {
              if (!user) return toast.error('Please log in to share your experience');
              setIsModalOpen(true);
            }}>
              Share Experience
            </Button>
          </div>

          {company.interviewExperiences.length === 0 ? (
            <div className="bg-secondary/20 border border-border p-6 sm:p-8 rounded-xl sm:rounded-2xl text-center text-muted-foreground text-sm">
              No interview experiences shared yet. Be the first to help out!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
            {company.interviewExperiences.map((exp, idx) => (
              <div
                key={idx}
                className="bg-background border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md hover:border-primary/40 transition-all flex flex-col group cursor-pointer"
                onClick={() => navigate(
                  `/companies/${slug}/experiences/${idx}`,
                  { state: { experience: exp, companyName: company.name, companyLogo: company.logo, companySlug: slug } }
                )}
              >
                <h3 className="text-sm sm:text-lg font-bold text-foreground mb-2 sm:mb-3 line-clamp-2">
                  {exp.title || 'Interview Experience'}
                </h3>
                <div className="relative flex-1">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 sm:line-clamp-4">
                    {exp.content}
                  </p>
                  <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 bg-gradient-to-t from-background to-transparent" />
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50 flex justify-between items-center">
                  <span className="text-[10px] sm:text-xs text-muted-foreground">
                    {new Date(exp.dateScraped || Date.now()).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="text-[10px] sm:text-xs font-semibold text-primary flex items-center gap-0.5">
                    Read Full <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
            </div>
          )}
        </div>
      )}

      <SubmitExperienceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        slug={slug} 
        onSuccess={fetchTrack} 
      />
    </div>
  );
}

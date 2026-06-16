import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTopics, startSession } from '@/api/aptitude';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Clock, FileText, BookOpen, Brain, Lock } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { SUBTOPIC_LABELS } from '@/constants';
import useAuthStore from '@/store/authStore';

// ─── MBA Topic config ──────────────────────────────────────────────────────────
const MBA_TOPICS = {
  quantitative: {
    label: 'Quantitative Aptitude',
    icon: '🔢',
    desc: 'Number systems, percentages, profit & loss, time & work, speed — the core of Quants.',
    catSection: 'Quant',
  },
  logical: {
    label: 'Logical Reasoning & DI',
    icon: '🧩',
    desc: 'Arrangements, puzzles, bar charts, caselets — the complete logical section.',
    catSection: 'Logical & DI',
  },
  verbal: {
    label: 'Verbal Ability & RC',
    icon: '📖',
    desc: 'Reading comprehension, para jumbles, fill in the blanks, para summary.',
    catSection: 'Verbal',
  },
  di: {
    label: 'Data Interpretation',
    icon: '📊',
    desc: 'Complex DI sets: tables, pie charts, line graphs — accuracy under time pressure.',
    catSection: 'Logical & DI',
  },
};

// ─── MBA-specific skill topics ─────────────────────────────────────────────────
const MBA_SKILL_TOPICS = [
  {
    key: 'case-study',
    label: 'Case Study Library',
    icon: '🗂️',
    desc: 'McKinsey, BCG, Bain frameworks — profitability, market entry, pricing, and M&A cases.',
    href: '/mba/cases',
    cta: 'Browse Cases',
    badge: 'Cases',
    color: 'bg-blue-500/10 text-blue-500',
  },
  {
    key: 'gd-pi',
    label: 'GD Practice Hub',
    icon: '🎤',
    desc: 'Group discussion topics with key arguments, vocabulary, and structured practice.',
    href: '/mba/gd',
    cta: 'Practice GD',
    badge: 'GD',
    color: 'bg-green-500/10 text-green-500',
  },
  {
    key: 'pi-prep',
    label: 'PI Question Bank',
    icon: '🤝',
    desc: 'HR interview questions, STAR framework answers, and mock interview sessions.',
    href: '/mba/pi',
    cta: 'Prep PI',
    badge: 'PI',
    color: 'bg-purple-500/10 text-purple-500',
  },
  {
    key: 'guesstimate',
    label: 'Guesstimate Practice',
    icon: '🧮',
    desc: 'Fermi estimation problems — market sizing, back-of-the-envelope calculations.',
    href: '/mba/guesstimates',
    cta: 'Estimate Now',
    badge: 'Quant',
    color: 'bg-orange-500/10 text-orange-500',
  },
  {
    key: 'wat',
    label: 'WAT Practice',
    icon: '✍️',
    desc: 'Written Ability Test prompts with sample essays and key points for IIM WAT rounds.',
    href: '/mba/wat',
    cta: 'Practice WAT',
    badge: 'WAT',
    color: 'bg-pink-500/10 text-pink-500',
  },
  {
    key: 'sectors',
    label: 'Sector Deep-Dives',
    icon: '🏭',
    desc: 'Consulting, FMCG, Banking, Tech — understand industries before your PI round.',
    href: '/mba/sectors',
    cta: 'Explore Sectors',
    badge: 'PI Prep',
    color: 'bg-teal-500/10 text-teal-500',
  },
];

// ─── CAT-pattern mock tests ────────────────────────────────────────────────────
const MBA_MOCK_TESTS = [
  {
    id: 'consulting-full-1',
    title: 'Consulting Aptitude Mock',
    duration: '120 min',
    durationSeconds: 7200,
    questions: 66,
    topics: ['quantitative', 'logical', 'verbal', 'di'],
    icon: '🎯',
    badge: 'Full Mock',
    desc: 'Full placement simulation: 40 min Verbal, 40 min Logical & DI, 40 min Quants — with on-screen calculator.',
  },
  {
    id: 'verbal-40',
    title: 'Verbal Sectional Mock',
    duration: '40 min',
    durationSeconds: 2400,
    questions: 24,
    topics: ['verbal'],
    icon: '📖',
    badge: 'Sectional',
    desc: 'Focused Verbal section: RC passages, para jumbles, and odd-one-out questions.',
  },
  {
    id: 'logical-40',
    title: 'Logical & DI Sectional Mock',
    duration: '40 min',
    durationSeconds: 2400,
    questions: 20,
    topics: ['logical', 'di'],
    icon: '🧩',
    badge: 'Sectional',
    desc: 'Data Interpretation & Logical Reasoning sets — the most challenging analytical section.',
  },
  {
    id: 'quant-40',
    title: 'Quants Sectional Mock',
    duration: '40 min',
    durationSeconds: 2400,
    questions: 22,
    topics: ['quantitative'],
    icon: '🔢',
    badge: 'Sectional',
    desc: 'Quant section: Arithmetic, Algebra, Geometry, and Number Systems.',
  },
  {
    id: 'decision-making-30',
    title: 'Decision Making Sprint',
    duration: '30 min',
    durationSeconds: 1800,
    questions: 21,
    topics: ['logical', 'verbal'],
    icon: '💡',
    badge: 'Case Prep',
    desc: 'Decision Making + Verbal — essential for consulting and strategy roles.',
  },
  {
    id: 'analytical-60',
    title: 'Analytical Sprint',
    duration: '60 min',
    durationSeconds: 3600,
    questions: 60,
    topics: ['quantitative', 'logical', 'verbal'],
    icon: '⚡',
    badge: 'Speed Test',
    desc: 'Fast-paced mock covering Quants, Analytical Reasoning, and Verbal — for quick problem solving.',
  },
];

const TABS = [
  { id: 'cat', label: 'Aptitude Topics', icon: '🔢' },
  { id: 'skills', label: 'MBA Skills', icon: '💼' },
  { id: 'mock', label: 'Mock Tests', icon: '🏆' },
];

// ─── Topic Card ───────────────────────────────────────────────────────────────
function TopicCard({ topicKey, config, topicData }) {
  const data = topicData[topicKey] || { count: 0, subTopics: [] };
  const count = data.count;

  return (
    <Link
      to={`/aptitude/topic/${topicKey}`}
      className="app-card-hover p-6 flex flex-col gap-4 group"
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl shrink-0">{config.icon}</span>
        <div className="min-w-0">
          <h3 className="font-bold text-base text-card-foreground group-hover:text-primary transition-colors">
            {config.label}
          </h3>
          {config.catSection && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary/70 bg-primary/10 px-2 py-0.5 rounded-md mt-1 inline-block">
              {config.catSection}
            </span>
          )}
          <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed line-clamp-2">{config.desc}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 mt-auto">
        <p className="text-sm text-muted-foreground">
          {count > 0 ? <span className="text-foreground font-semibold">{count}</span> : 'No'} questions available
        </p>
        {data.subTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.subTopics.slice(0, 3).map(st => (
              <span key={st.name} className="text-[11px] font-medium bg-secondary px-2.5 py-1 rounded-lg text-secondary-foreground">
                {SUBTOPIC_LABELS[st.name] || st.name.replace(/_/g, ' ')}
              </span>
            ))}
            {data.subTopics.length > 3 && (
              <span className="text-[11px] font-medium bg-secondary px-2.5 py-1 rounded-lg text-muted-foreground">
                +{data.subTopics.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      <span className="text-sm font-medium text-primary flex items-center gap-1.5 mt-auto">
        Practice Now <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}

// ─── Skill Topic Card ─────────────────────────────────────────────────────────
function SkillCard({ config }) {
  return (
    <Link to={config.href} className="app-card-hover p-6 flex flex-col gap-4 group">
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0">{config.icon}</span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-base group-hover:text-primary transition-colors">{config.label}</h3>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${config.color}`}>
              {config.badge}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-3">{config.desc}</p>
        </div>
      </div>
      <span className="mt-auto text-sm font-medium text-primary flex items-center gap-1.5">
        {config.cta} <ArrowRight className="w-4 h-4" />
      </span>
    </Link>
  );
}

// ─── Mock Test Card ───────────────────────────────────────────────────────────
function MockTestCard({ test, onStart, starting }) {
  return (
    <div className="app-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-3xl">{test.icon}</span>
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
          {test.badge}
        </span>
      </div>
      <div>
        <h3 className="font-bold text-base text-card-foreground">{test.title}</h3>
        <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{test.desc}</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground border-t border-border pt-4">
        <span className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> {test.duration}
        </span>
        <span className="flex items-center gap-1.5">
          <FileText className="w-4 h-4" /> {test.questions} Qs
        </span>
      </div>

      <button
        onClick={() => onStart(test)}
        disabled={starting}
        className="w-full mt-auto py-2.5 rounded-xl text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/15 border border-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {starting ? 'Starting…' : '▶ Start Mock Test'}
      </button>
    </div>
  );
}

// ─── Locked Feature Card ────────────────────────────────────────────────────────
function LockedFeatureCard({ title = "Show More", desc = "Login to unlock all features and analytics." }) {
  return (
    <Link to="/auth/login" className="app-card-hover p-6 flex flex-col items-center justify-center gap-3 text-center border-dashed border-2 bg-secondary/5 hover:bg-secondary/10 group min-h-[220px]">
      <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
        <Lock className="w-5 h-5 text-muted-foreground" />
      </div>
      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MbaPracticeHub() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('cat');
  const [topicData, setTopicData] = useState({});
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    getTopics()
      .then(res => {
        const data = {};
        (res.data.topics || []).forEach(t => {
          data[t.topic] = { count: t.count, subTopics: t.subTopics || [] };
        });
        setTopicData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleStartMock = async (test) => {
    try {
      setStarting(true);
      const res = await startSession({
        sessionType: 'mock-test',
        topic: test.topics[0],
        limit: Math.min(test.questions, 30),
        timeLimitSeconds: test.durationSeconds,
      });
      navigate(`/aptitude/session/${res.data.sessionId}`);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to start mock test');
      setStarting(false);
    }
  };

  return (
    <>
      <SEO
        title="MBA Placement Practice Hub | Prepster"
        description="Practice placement aptitude questions. Take sectional and full mocks for Logical, Verbal, and Quants."
        keywords="MBA placement preparation, aptitude mocks, consulting prep, DILR practice, VARC prep, Quants"
        url="https://prepster.in/aptitude"
      />
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">MBA Placement Practice Hub</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Sharpen your aptitude skills for consulting and MBA placements — Logical, Verbal, Quants, and full mocks.
            </p>
          </div>
          <Link
            to="/aptitude/daily"
            className="inline-flex items-center gap-2 text-sm font-semibold bg-primary/10 border border-primary/20 text-primary px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors w-fit"
          >
            📅 Daily Challenge
          </Link>
        </div>

        <AdPlaceholder slot="7946069083" className="h-[90px] mb-2" />

        {/* Tabs */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex gap-1 bg-secondary/50 border border-border rounded-2xl p-1 w-fit min-w-fit">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-card text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split('/')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="app-card p-6 h-52 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* CAT Topics */}
            {activeTab === 'cat' && (
              <div>
                <p className="text-sm text-muted-foreground mb-6">
                  Core aptitude topics for placements. Practice section-by-section to build accuracy and speed.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {Object.entries(MBA_TOPICS).map(([key, cfg]) => (
                    <TopicCard key={key} topicKey={key} config={cfg} topicData={topicData} />
                  ))}
                  {!user && <LockedFeatureCard title="More Topics" desc="Login to unlock all aptitude topics and analytics." />}
                </div>
              </div>
            )}

            {/* MBA Skills */}
            {activeTab === 'skills' && (
              <div>
                <p className="text-sm text-muted-foreground mb-6">
                  Go beyond the aptitude test — prepare for Case Interviews, GD/PI rounds, and WAT.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MBA_SKILL_TOPICS.map((cfg) => (
                    <SkillCard key={cfg.key} config={cfg} />
                  ))}
                  {!user && <LockedFeatureCard title="More Skills" desc="Login to unlock all MBA skills and interview prep." />}
                </div>
              </div>
            )}

            {/* MBA Mocks */}
            {activeTab === 'mock' && (
              <div>
                <p className="text-sm text-muted-foreground mb-6">
                  Placement pattern mocks for top companies. Sectional tests for targeted improvement.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MBA_MOCK_TESTS.map(test => (
                    <MockTestCard key={test.id} test={test} onStart={handleStartMock} starting={starting} />
                  ))}
                  {!user && <LockedFeatureCard title="More Mock Tests" desc="Login to access all consulting mock tests." />}
                </div>
                <div className="mt-8 app-card p-5 border-primary/20 bg-primary/5 flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Placement Tip:</strong> Attempt your strongest sections first — placement tests reward strategic time management. Use the timer to simulate real interview pressure.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

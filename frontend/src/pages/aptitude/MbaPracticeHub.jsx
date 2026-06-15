import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTopics, startSession } from '@/api/aptitude';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Clock, FileText, BookOpen, Brain } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { SUBTOPIC_LABELS } from '@/constants';

// ─── MBA Topic config ──────────────────────────────────────────────────────────
const MBA_TOPICS = {
  quantitative: {
    label: 'Quantitative Aptitude',
    icon: '🔢',
    desc: 'Number systems, percentages, profit & loss, time & work, speed — the core of CAT Quants.',
    catSection: 'VARC + QA',
  },
  logical: {
    label: 'Logical Reasoning & DI',
    icon: '🧩',
    desc: 'Arrangements, puzzles, bar charts, caselets — the complete CAT DILR section.',
    catSection: 'DILR',
  },
  verbal: {
    label: 'Verbal Ability & RC',
    icon: '📖',
    desc: 'Reading comprehension, para jumbles, fill in the blanks, para summary.',
    catSection: 'VARC',
  },
  di: {
    label: 'Data Interpretation',
    icon: '📊',
    desc: 'Complex DI sets: tables, pie charts, line graphs — accuracy under time pressure.',
    catSection: 'DILR',
  },
};

// ─── MBA-specific skill topics ─────────────────────────────────────────────────
const MBA_SKILL_TOPICS = {
  'case-study':    { label: 'Case Study Frameworks', icon: '🗂️', desc: 'McKinsey, BCG, Bain frameworks — profitability, market entry, pricing, and M&A cases.' },
  'gd-pi':         { label: 'GD/PI Preparation',     icon: '🎤', desc: 'Group discussion topics, HR interview questions, and MBA PI prep.' },
  'current-affairs':{ label: 'Current Affairs',      icon: '📰', desc: 'Business news, economic indicators, and current events — essential for WAT/PI rounds.' },
  'business-math': { label: 'Business Mathematics',  icon: '💹', desc: 'Financial ratios, NPV, IRR, statistics, and quantitative methods for management.' },
};

// ─── CAT-pattern mock tests ────────────────────────────────────────────────────
const MBA_MOCK_TESTS = [
  {
    id: 'cat-slot-1',
    title: 'CAT Full Mock — Slot 1',
    duration: '120 min',
    durationSeconds: 7200,
    questions: 66,
    topics: ['quantitative', 'logical', 'verbal', 'di'],
    icon: '🎯',
    badge: 'CAT Pattern',
    desc: 'Full CAT simulation: 40 min VARC, 40 min DILR, 40 min QA — with on-screen calculator.',
  },
  {
    id: 'cat-varc-40',
    title: 'VARC Sectional Mock',
    duration: '40 min',
    durationSeconds: 2400,
    questions: 24,
    topics: ['verbal'],
    icon: '📖',
    badge: 'Sectional',
    desc: 'Focused VARC section: RC passages, para jumbles, and odd-one-out questions.',
  },
  {
    id: 'cat-dilr-40',
    title: 'DILR Sectional Mock',
    duration: '40 min',
    durationSeconds: 2400,
    questions: 20,
    topics: ['logical', 'di'],
    icon: '🧩',
    badge: 'Sectional',
    desc: 'Data Interpretation & Logical Reasoning sets — the most challenging CAT section.',
  },
  {
    id: 'cat-qa-40',
    title: 'Quants Sectional Mock',
    duration: '40 min',
    durationSeconds: 2400,
    questions: 22,
    topics: ['quantitative'],
    icon: '🔢',
    badge: 'Sectional',
    desc: 'CAT Quant section: Arithmetic, Algebra, Geometry, and Number Systems.',
  },
  {
    id: 'xat-30',
    title: 'XAT Decision Making Sprint',
    duration: '30 min',
    durationSeconds: 1800,
    questions: 21,
    topics: ['logical', 'verbal'],
    icon: '💡',
    badge: 'XAT Pattern',
    desc: 'XAT-style Decision Making + Verbal — unique to XLRI, XIMB, and TAPMI.',
  },
  {
    id: 'snap-40',
    title: 'SNAP Analytical Sprint',
    duration: '60 min',
    durationSeconds: 3600,
    questions: 60,
    topics: ['quantitative', 'logical', 'verbal'],
    icon: '⚡',
    badge: 'SNAP Pattern',
    desc: 'SNAP-pattern mock covering QA, Analytical Reasoning, and GK — for Symbiosis institutes.',
  },
];

const TABS = [
  { id: 'cat', label: 'CAT/XAT Topics', icon: '🔢' },
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
              CAT: {config.catSection}
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
    <div className="app-card p-6 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="text-3xl shrink-0">{config.icon}</span>
        <div className="min-w-0">
          <h3 className="font-bold text-base">{config.label}</h3>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-3">{config.desc}</p>
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2.5 flex items-center gap-2">
          <Brain className="w-3.5 h-3.5 shrink-0 text-primary" />
          <span>Content coming soon — check back for GD topics and case study banks!</span>
        </div>
      </div>
    </div>
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MbaPracticeHub() {
  const navigate = useNavigate();
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
        title="CAT/XAT & MBA Practice Hub | Prepster"
        description="Practice CAT, XAT, SNAP pattern questions. Take sectional and full mocks for DILR, VARC, and Quants."
        keywords="CAT preparation, XAT mocks, MBA entrance, DILR practice, VARC prep, Quants CAT"
        url="https://prepster.in/aptitude"
      />
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">CAT/XAT Practice Hub</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              Sharpen your MBA entrance skills — DILR, VARC, Quants, and full CAT mocks.
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
                  Core CAT/XAT/SNAP topics. Practice section-by-section to build accuracy and speed.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  {Object.entries(MBA_TOPICS).map(([key, cfg]) => (
                    <TopicCard key={key} topicKey={key} config={cfg} topicData={topicData} />
                  ))}
                </div>
              </div>
            )}

            {/* MBA Skills */}
            {activeTab === 'skills' && (
              <div>
                <p className="text-sm text-muted-foreground mb-6">
                  Go beyond the entrance exam — prepare for Case Interviews, GD/PI rounds, and WAT.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(MBA_SKILL_TOPICS).map(([key, cfg]) => (
                    <SkillCard key={key} config={cfg} />
                  ))}
                </div>
              </div>
            )}

            {/* MBA Mocks */}
            {activeTab === 'mock' && (
              <div>
                <p className="text-sm text-muted-foreground mb-6">
                  CAT, XAT, and SNAP pattern mocks. Sectional tests for targeted improvement.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {MBA_MOCK_TESTS.map(test => (
                    <MockTestCard key={test.id} test={test} onStart={handleStartMock} starting={starting} />
                  ))}
                </div>
                <div className="mt-8 app-card p-5 border-primary/20 bg-primary/5 flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">CAT Tip:</strong> Attempt DILR and VARC sections first if you're stronger in those — the CAT scoring rewards strategic section attempts. Use the timer to simulate real exam pressure.
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

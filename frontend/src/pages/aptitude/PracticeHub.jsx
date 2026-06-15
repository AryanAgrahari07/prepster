import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getTopics, startSession } from '@/api/aptitude';
import { Button } from '@/components/ui/Button';
import { ArrowRight, Clock, FileText, BookOpen } from 'lucide-react';
import SEO from '@/components/seo/SEO';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import { SUBTOPIC_LABELS } from '@/constants';
import useAuthStore from '@/store/authStore';
import MbaPracticeHub from './MbaPracticeHub';

// ─── Topic config ─────────────────────────────────────────────────────────────
export const APTITUDE_TOPICS = {
  quantitative: { label: 'Quantitative Aptitude', icon: '🔢', desc: 'Numbers, algebra, percentages, time & work, speed & distance.' },
  logical:      { label: 'Logical Reasoning',     icon: '🧩', desc: 'Puzzles, seating arrangement, blood relations, syllogisms.' },
  verbal:       { label: 'Verbal Ability',         icon: '📖', desc: 'Reading comprehension, grammar, vocabulary, para jumbles.' },
  di:           { label: 'Data Interpretation',    icon: '📊', desc: 'Charts, tables, bar graphs, pie charts — crunch the data.' },
};

export const CS_TOPICS = {
  dsa:           { label: 'Data Structures & Algorithms', icon: '🌳', desc: 'Arrays, trees, graphs, DP, sorting — the bread & butter of coding interviews.' },
  os:            { label: 'Operating Systems',             icon: '💻', desc: 'Processes, threads, scheduling, memory management, deadlocks.' },
  dbms:          { label: 'DBMS',                          icon: '🗄️', desc: 'Normalization, transactions, ACID, ER diagrams, concurrency control.' },
  sql:           { label: 'SQL',                           icon: '🔍', desc: 'Queries, joins, window functions, indexing — essential for every SDE.' },
  cn:            { label: 'Computer Networks',             icon: '🌐', desc: 'TCP/IP, HTTP, DNS, OSI model, routing & switching.' },
  oops:          { label: 'OOP Concepts',                  icon: '🧱', desc: 'Encapsulation, inheritance, polymorphism, abstraction, design patterns.' },
  'system-design':{ label: 'System Design',               icon: '🏗️', desc: 'Scalable system architecture, load balancing, caching, databases.' },
  se:            { label: 'Software Engineering',          icon: '🛠️', desc: 'SDLC, Agile, testing, software development models.' },
  web:           { label: 'Web Technologies',              icon: '🕸️', desc: 'HTML, CSS, JavaScript, React, Node.js fundamentals.' },
  cloud:         { label: 'Cloud Computing',               icon: '☁️', desc: 'AWS, Azure, virtualization, cloud architecture.' },
  ml:            { label: 'Machine Learning',              icon: '🤖', desc: 'Supervised/Unsupervised learning, neural networks, AI basics.' },
};

// ─── Mock test configs ────────────────────────────────────────────────────────
const MOCK_TESTS = [
  {
    id: 'placement-30',
    title: 'Placement Aptitude Sprint',
    duration: '30 min',
    durationSeconds: 1800,
    questions: 30,
    topics: ['quantitative', 'logical'],
    difficulty: null,
    icon: '⚡',
    badge: 'Quick',
    desc: 'A rapid-fire aptitude round mimicking Tier-1 campus placement tests.',
  },
  {
    id: 'full-aptitude-60',
    title: 'Full Aptitude Mock',
    duration: '60 min',
    durationSeconds: 3600,
    questions: 60,
    topics: ['quantitative', 'logical', 'verbal', 'di'],
    difficulty: null,
    icon: '🎯',
    badge: 'Standard',
    desc: 'Full-length mock covering all aptitude topics — ideal for TCS, Infosys, Wipro prep.',
  },
  {
    id: 'sde-core-60',
    title: 'SDE Core CS Mock',
    duration: '60 min',
    durationSeconds: 3600,
    questions: 50,
    topics: ['dsa', 'os', 'dbms', 'cn', 'oops'],
    difficulty: null,
    icon: '🧠',
    badge: 'SDE Focus',
    desc: 'Core CS subjects test — perfect for on-campus SDE interviews.',
  },
  {
    id: 'mega-90',
    title: 'Mega Placement Mock',
    duration: '90 min',
    durationSeconds: 5400,
    questions: 90,
    topics: ['quantitative', 'logical', 'verbal', 'dsa', 'dbms', 'os'],
    difficulty: null,
    icon: '🏆',
    badge: 'Full Length',
    desc: 'The complete placement test experience — aptitude + core CS combined.',
  },
  {
    id: 'system-design-45',
    title: 'System Design Foundations',
    duration: '45 min',
    durationSeconds: 2700,
    questions: 40,
    topics: ['system-design', 'dsa'],
    difficulty: null,
    icon: '🏗️',
    badge: 'Advanced',
    desc: 'System Design + DSA combo — crack product company final rounds.',
  },
  {
    id: 'sql-dbms-30',
    title: 'SQL & DBMS Blitz',
    duration: '30 min',
    durationSeconds: 1800,
    questions: 30,
    topics: ['sql', 'dbms'],
    difficulty: null,
    icon: '🔍',
    badge: 'Quick',
    desc: 'Focused SQL & DBMS prep for data-heavy roles and analytics rounds.',
  },
];

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  { id: 'aptitude', label: 'Aptitude & Reasoning', icon: '🔢' },
  { id: 'cs',       label: 'Core CS Subjects',     icon: '💡' },
  { id: 'mock',     label: 'Mock Tests',            icon: '🏆' },
];

export const DIFF_CONFIG = [
  { key: 'easy',   label: 'Easy',   color: 'text-green-500',  border: 'border-green-500/30', hover: 'hover:bg-green-500/10' },
  { key: 'medium', label: 'Medium', color: 'text-yellow-500', border: 'border-yellow-500/30', hover: 'hover:bg-yellow-500/10' },
  { key: 'hard',   label: 'Hard',   color: 'text-red-500',    border: 'border-red-500/30',    hover: 'hover:bg-red-500/10' },
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
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed line-clamp-2">{config.desc}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-4 mt-auto">
        <p className="text-sm text-muted-foreground">
          {count > 0 ? <span className="text-foreground font-semibold">{count}</span> : 'No'} questions available
        </p>
        {data.subTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.subTopics.slice(0, 4).map(st => (
              <span key={st.name} className="text-[11px] font-medium bg-secondary px-2.5 py-1 rounded-lg text-secondary-foreground">
                {SUBTOPIC_LABELS[st.name] || st.name.replace(/_/g, ' ')}
              </span>
            ))}
            {data.subTopics.length > 4 && (
              <span className="text-[11px] font-medium bg-secondary px-2.5 py-1 rounded-lg text-muted-foreground">
                +{data.subTopics.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      <span className="text-sm font-medium text-primary flex items-center gap-1.5 mt-auto">
        View All Topics <ArrowRight className="w-4 h-4" />
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
        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
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

      <div className="flex flex-wrap gap-1.5">
        {test.topics.slice(0, 4).map(t => (
          <span key={t} className="text-[11px] font-medium bg-secondary px-2.5 py-1 rounded-lg text-secondary-foreground capitalize">
            {t === 'system-design' ? 'Sys Design' : t === 'di' ? 'Data Interp.' : t.toUpperCase()}
          </span>
        ))}
        {test.topics.length > 4 && (
          <span className="text-[11px] font-medium bg-secondary px-2.5 py-1 rounded-lg text-muted-foreground">
            +{test.topics.length - 4} more
          </span>
        )}
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
export default function PracticeHub() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('aptitude');
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

  // Route MBA students to dedicated hub (after hooks)
  if (user?.stream === 'mba') {
    return <MbaPracticeHub />;
  }

  const handleStartPractice = async (topic, difficulty, subTopic) => {
    try {
      setStarting(true);
      const res = await startSession({ sessionType: 'practice', topic, subTopic: subTopic || undefined, difficulty, limit: 10 });
      navigate(`/aptitude/session/${res.data.sessionId}`);
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to start session');
      setStarting(false);
    }
  };

  const handleStartMock = async (test) => {
    try {
      setStarting(true);
      // Start with first topic in the test list; backend will mix topics via tags
      const res = await startSession({
        sessionType: 'mock-test',
        topic: test.topics[0],
        limit: Math.min(test.questions, 30), // cap for now until question bank grows
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
        title="Aptitude & Technical Practice Hub | Prepster" 
        description="Practice 5000+ aptitude and core CS questions. Take full mock tests to simulate company placement exams." 
        keywords="aptitude practice, quantitative aptitude, logical reasoning, data structures, placement mock tests"
        url="https://prepster.in/aptitude"
        schema={{
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Placement Aptitude & CS Preparation",
          "description": "Comprehensive practice material for campus placements including quantitative aptitude, logical reasoning, verbal ability, and core CS subjects.",
          "provider": {
            "@type": "Organization",
            "name": "Prepster",
            "sameAs": "https://prepster.in"
          }
        }}
      />
      <div className="space-y-8">
        {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Practice Hub</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Sharpen your skills across aptitude, core CS, and full mock tests.</p>
        </div>
        <Link
          to="/aptitude/daily"
          className="inline-flex items-center gap-2 text-sm font-semibold bg-primary/10 border border-primary/20 text-primary px-4 py-2.5 rounded-xl hover:bg-primary/15 transition-colors w-fit"
        >
          📅 Daily Challenge
        </Link>
      </div>

      <AdPlaceholder slot="7946069083" className="h-[90px] mb-2" />

      {/* Tabs — horizontal scroll on mobile */}
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
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="app-card p-6 h-52 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {/* ── Aptitude & Reasoning ── */}
          {activeTab === 'aptitude' && (
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                Classic aptitude &amp; reasoning topics tested in campus placements at TCS, Infosys, Wipro, and more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {Object.entries(APTITUDE_TOPICS).map(([key, cfg]) => (
                  <TopicCard
                    key={key}
                    topicKey={key}
                    config={cfg}
                    topicData={topicData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Core CS Subjects ── */}
          {activeTab === 'cs' && (
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                Core computer science subjects — essential for SDE interviews at product companies and on-campus rounds.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(CS_TOPICS).map(([key, cfg]) => (
                  <TopicCard
                    key={key}
                    topicKey={key}
                    config={cfg}
                    topicData={topicData}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Mock Tests ── */}
          {activeTab === 'mock' && (
            <div>
              <p className="text-sm text-muted-foreground mb-6">
                Timed mock tests simulating real placement exam patterns. Build stamina and time management skills.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {MOCK_TESTS.map(test => (
                  <MockTestCard key={test.id} test={test} onStart={handleStartMock} starting={starting} />
                ))}
              </div>
              <div className="mt-8 app-card p-5 border-primary/20 bg-primary/5 flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> Mock tests are timed — the timer starts immediately. Make sure you have a quiet environment and 30–90 minutes free before starting.
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

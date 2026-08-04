import { useState, useEffect } from 'react';
import { getGuesstimates, getGuesstimatById } from '@/api/mba';
import useAuthStore from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import SEO from '@/components/seo/SEO';
import { schemas } from '@/components/seo/SchemaTemplates';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, BarChart2, ArrowRight, Lock, CheckCircle2,
  ChevronDown, ChevronUp, Lightbulb, Calculator, Target
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORY_LABELS = {
  'market-sizing': 'Market Sizing',
  'fermi':         'Fermi Estimation',
  'supply-demand': 'Supply & Demand',
  'revenue':       'Revenue Estimation',
  'other':         'Other',
};

const DIFFICULTY_CONFIG = {
  easy:   { label: 'Easy',   className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  medium: { label: 'Medium', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  hard:   { label: 'Hard',   className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const APPROACH_LABELS = {
  'top-down':   '🔽 Top-Down',
  'bottom-up':  '🔼 Bottom-Up',
  'comparative':'🔁 Comparative',
};

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-secondary/60 text-muted-foreground border-border hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

export default function GuesstimatePractice() {
  const { user } = useAuthStore();
  const isPro = user?.subscription?.plan === 'pro';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeItem, setActiveItem] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [myEstimate, setMyEstimate] = useState('');

  // Filters
  const [catFilter, setCatFilter] = useState('all');
  const [diffFilter, setDiffFilter] = useState('all');

  const fetchList = () => {
    setLoading(true);
    const params = {};
    if (catFilter !== 'all')  params.category   = catFilter;
    if (diffFilter !== 'all') params.difficulty  = diffFilter;

    getGuesstimates(params)
      .then(res => { setItems(res.data.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchList(); }, [catFilter, diffFilter]); // eslint-disable-line

  const handleOpen = async (item) => {
    setDetailLoading(true);
    setShowSolution(false);
    setShowHint(false);
    setMyEstimate('');
    setActiveItem(null);
    try {
      const res = await getGuesstimatById(item._id);
      setActiveItem(res.data.data);
    } catch {
      setActiveItem(item); // fallback to list item
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SEO
        title="Guesstimates & Market Sizing | Prepster"
        description="Master guesstimate questions and market sizing cases for consulting interviews."
        schema={[
          schemas.course({
            name: "Guesstimates Preparation",
            description: "Master guesstimate questions and market sizing cases for consulting interviews.",
            url: "/mba/guesstimates"
          })
        ]}
      />

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Guesstimate Practice</h1>
        <p className="text-muted-foreground mt-1">
          Hone your estimation instincts — the skill every consultant, PM, and analyst needs.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ── Left Panel: list ─────────────────────────────────────── */}
        <div className={`space-y-4 ${activeItem ? 'hidden lg:block lg:w-[380px] shrink-0' : 'w-full'}`}>

          {/* Category filters */}
          <div className="flex flex-wrap gap-2">
            <FilterChip label="All Types"     active={catFilter === 'all'}           onClick={() => setCatFilter('all')} />
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <FilterChip key={k} label={v} active={catFilter === k} onClick={() => setCatFilter(k)} />
            ))}
          </div>

          {/* Difficulty filters */}
          <div className="flex gap-2">
            <FilterChip label="All Levels" active={diffFilter === 'all'}    onClick={() => setDiffFilter('all')} />
            <FilterChip label="Easy"       active={diffFilter === 'easy'}   onClick={() => setDiffFilter('easy')} />
            <FilterChip label="Medium"     active={diffFilter === 'medium'} onClick={() => setDiffFilter('medium')} />
            <FilterChip label="Hard"       active={diffFilter === 'hard'}   onClick={() => setDiffFilter('hard')} />
          </div>

          {/* List */}
          {loading ? (
            <div className="py-16 flex flex-col items-center gap-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span>Loading guesstimates…</span>
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center app-card border-dashed text-muted-foreground">
              <Calculator className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-semibold">No guesstimates found</p>
              <p className="text-sm mt-1">Try changing your filters or check back later.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const diff = DIFFICULTY_CONFIG[item.difficulty];
                const isSelected = activeItem?._id === item._id;
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => handleOpen(item)}
                    className={`app-card p-4 cursor-pointer transition-all hover:border-primary/50 ${
                      isSelected ? 'border-primary/60 bg-primary/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm leading-snug line-clamp-2">{item.question}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-[10px] font-bold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full border border-border">
                            {CATEGORY_LABELS[item.category] || item.category}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${diff?.className}`}>
                            {diff?.label}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className={`w-4 h-4 shrink-0 mt-1 transition-colors ${isSelected ? 'text-primary' : 'text-muted-foreground/50'}`} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right Panel: detail ──────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {detailLoading && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex-1 flex items-center justify-center py-24 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
            </motion.div>
          )}

          {!detailLoading && activeItem && (
            <motion.div
              key={activeItem._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 min-w-0 space-y-5"
            >
              {/* Back button on mobile */}
              <div className="lg:hidden">
                <Button variant="outline" size="sm" onClick={() => setActiveItem(null)}>
                  ← Back to list
                </Button>
              </div>

              <div className="app-card p-0 overflow-hidden">
                {/* Question Header */}
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${DIFFICULTY_CONFIG[activeItem.difficulty]?.className}`}>
                      {DIFFICULTY_CONFIG[activeItem.difficulty]?.label}
                    </span>
                    <span className="text-[10px] font-bold bg-secondary text-secondary-foreground px-2 py-0.5 rounded-full border border-border">
                      {CATEGORY_LABELS[activeItem.category]}
                    </span>
                    {activeItem.approach && (
                      <span className="text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                        {APPROACH_LABELS[activeItem.approach]}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold leading-relaxed">{activeItem.question}</h2>
                </div>

                <div className="p-6 space-y-6">
                  {/* Hint */}
                  {activeItem.hint && (
                    <div>
                      <button
                        onClick={() => setShowHint(v => !v)}
                        className="flex items-center gap-2 text-sm font-semibold text-yellow-500 hover:text-yellow-400 transition-colors"
                      >
                        <Lightbulb className="w-4 h-4" />
                        {showHint ? 'Hide Hint' : 'Show Hint'}
                        {showHint ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <AnimatePresence>
                        {showHint && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-3 p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-xl text-sm text-muted-foreground"
                          >
                            💡 {activeItem.hint}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* My Estimate scratchpad */}
                  <div>
                    <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" /> Your Estimate
                    </label>
                    <textarea
                      value={myEstimate}
                      onChange={e => setMyEstimate(e.target.value)}
                      rows={4}
                      className="w-full bg-background border border-input rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
                      placeholder="Work through your logic here… e.g. Population × Penetration × Usage = Market Size"
                    />
                  </div>

                  {/* Solution Section */}
                  {activeItem.isLocked ? (
                    <div className="text-center p-8 border border-primary/20 bg-primary/5 rounded-xl">
                      <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
                      <h3 className="text-lg font-bold mb-2">Solution Locked</h3>
                      <p className="text-sm text-muted-foreground mb-5 max-w-sm mx-auto">
                        Upgrade to Pro to unlock step-by-step breakdowns, key assumptions, and final answers for every guesstimate.
                      </p>
                      <Link to="/upgrade">
                        <Button className="font-bold">Upgrade to Pro</Button>
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => setShowSolution(v => !v)}
                        className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold text-sm hover:bg-primary/15 transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <BarChart2 className="w-4 h-4" />
                          {showSolution ? 'Hide Solution' : 'Reveal Step-by-Step Solution'}
                        </span>
                        {showSolution ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <AnimatePresence>
                        {showSolution && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 space-y-4"
                          >
                            {/* Steps */}
                            {activeItem.solutionSteps?.length > 0 && (
                              <div className="space-y-3">
                                {activeItem.solutionSteps.map((s, i) => (
                                  <div key={i} className="flex gap-4 p-4 border border-border rounded-xl bg-background">
                                    <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-sm">
                                      {i + 1}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-sm">{s.step}</p>
                                      <p className="text-sm text-muted-foreground mt-1">{s.explanation}</p>
                                      {s.value && (
                                        <p className="mt-2 text-xs font-mono bg-secondary px-3 py-1 rounded-lg inline-block border border-border">
                                          → {s.value}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Key Assumptions */}
                            {activeItem.keyAssumptions?.length > 0 && (
                              <div className="p-4 bg-secondary/20 border border-border rounded-xl">
                                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Key Assumptions
                                </h4>
                                <ul className="space-y-1.5">
                                  {activeItem.keyAssumptions.map((a, i) => (
                                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                      <span className="text-primary mt-0.5">•</span> {a}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Final Answer */}
                            {activeItem.finalAnswer && (
                              <div className="p-5 bg-green-500/5 border border-green-500/20 rounded-xl text-center">
                                <p className="text-xs font-bold uppercase tracking-wider text-green-500 mb-1">Final Estimate</p>
                                <p className="text-2xl font-black text-green-400">{activeItem.finalAnswer}</p>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

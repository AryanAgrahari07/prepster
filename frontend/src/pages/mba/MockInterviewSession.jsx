import { useState, useEffect, useRef, useCallback } from 'react';
import {
  startMockInterview, submitMockInterviewAnswer,
  finishMockInterview, listMockInterviews, getMockInterviewById
} from '@/api/mba';
import useAuthStore from '@/store/authStore';
import { Link } from 'react-router-dom';
import SEO from '@/components/seo/SEO';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, Play, Star, ChevronRight, ChevronLeft, CheckCircle2,
  Clock, BarChart2, Lock, Trophy, History
} from 'lucide-react';

const QUESTION_TIME_SECONDS = 120; // 2 minutes per question
const QUESTION_COUNTS = [5, 8, 10, 12];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`transition-colors ${n <= value ? 'text-yellow-400' : 'text-muted-foreground/30 hover:text-yellow-400/60'}`}
        >
          <Star className="w-7 h-7" fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}

// ─── Lobby / Start Screen ─────────────────────────────────────────────────────
function Lobby({ isPro, onStart, history, histLoading }) {
  const [count, setCount] = useState(8);
  const [starting, setStarting] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    await onStart(count);
    setStarting(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Mock PI Interview</h1>
        <p className="text-muted-foreground mt-1">
          Simulate a real Personal Interview. Answer timed questions and self-rate your performance.
        </p>
      </div>

      {!isPro && (
        <div className="flex items-start gap-4 p-5 bg-primary/5 border border-primary/20 rounded-xl">
          <Lock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Pro feature</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Mock Interviews are available exclusively to Pro subscribers.
            </p>
          </div>
          <Link to="/upgrade"><Button size="sm">Upgrade</Button></Link>
        </div>
      )}

      <div className="app-card p-6 space-y-5">
        <h2 className="font-bold text-lg">Configure Your Session</h2>

        <div>
          <p className="text-sm font-semibold mb-3">Number of Questions</p>
          <div className="flex gap-2 flex-wrap">
            {QUESTION_COUNTS.map(c => (
              <button
                key={c}
                onClick={() => setCount(c)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-all ${
                  count === c
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:border-primary/50 text-muted-foreground'
                }`}
              >{c} Questions</button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl text-sm text-muted-foreground">
          <Clock className="w-5 h-5 shrink-0 text-primary" />
          <span>Each question has a <strong className="text-foreground">{fmtTime(QUESTION_TIME_SECONDS)}</strong> timer. Questions are randomly selected from the PI bank.</span>
        </div>

        <Button
          onClick={handleStart}
          disabled={!isPro || starting}
          className="w-full gap-2 text-base py-3"
        >
          {starting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          {starting ? 'Preparing Questions…' : 'Start Mock Interview'}
        </Button>
      </div>

      {/* Past sessions */}
      <div>
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2"><History className="w-5 h-5 text-muted-foreground" /> Past Sessions</h2>
        {histLoading ? (
          <div className="text-muted-foreground text-sm flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
        ) : history.length === 0 ? (
          <div className="text-sm text-muted-foreground border border-dashed border-border rounded-xl p-6 text-center">No sessions yet. Complete your first mock interview above!</div>
        ) : (
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={h._id} className="app-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{h.answers?.length || '?'} Questions</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(h.completedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}{fmtTime(h.totalTimeTakenSeconds || 0)} total
                  </p>
                </div>
                {h.avgSelfRating && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm font-bold">{h.avgSelfRating}/5</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Active Session ───────────────────────────────────────────────────────────
function ActiveSession({ session, questions, onFinish }) {
  const total = questions.length;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState(() => questions.map(() => ({ text: '', rating: 0, time: 0 })));
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME_SECONDS);
  const [saving, setSaving] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const startRef = useRef(Date.now());
  const timerRef = useRef(null);

  // Countdown timer — auto-advance when time runs out
  useEffect(() => {
    startRef.current = Date.now();
    setTimeLeft(QUESTION_TIME_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); handleNext(true); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx]); // eslint-disable-line

  const handleNext = useCallback(async (autoAdvanced = false) => {
    clearInterval(timerRef.current);
    const elapsed = Math.round((Date.now() - startRef.current) / 1000);
    const updated = answers.map((a, i) => i === idx ? { ...a, time: elapsed } : a);
    setAnswers(updated);

    setSaving(true);
    try {
      await submitMockInterviewAnswer(session._id, {
        index: idx,
        userAnswer: updated[idx].text,
        selfRating: updated[idx].rating || undefined,
        timeTakenSeconds: elapsed,
      });
    } catch { /* silent */ }
    setSaving(false);

    if (idx < total - 1) {
      setIdx(i => i + 1);
    } else {
      // Last question — finish session
      setFinishing(true);
      try {
        const res = await finishMockInterview(session._id);
        onFinish(res.data.data);
      } catch { setFinishing(false); }
    }
  }, [idx, answers, session._id, total, onFinish]);

  const q = questions[idx];
  const ans = answers[idx];
  const progress = ((idx) / total) * 100;
  const timerColor = timeLeft <= 20 ? 'text-red-400' : timeLeft <= 60 ? 'text-yellow-400' : 'text-green-400';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5 font-medium">
          <span>Question {idx + 1} of {total}</span>
          <span className={`font-bold tabular-nums ${timerColor}`}><Clock className="w-3.5 h-3.5 inline mr-1" />{fmtTime(timeLeft)}</span>
        </div>
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
          <motion.div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
          className="app-card p-6 space-y-6"
        >
          {/* Question type badge */}
          {q.type && (
            <span className="text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
              {q.type}
            </span>
          )}

          <h2 className="text-xl font-bold leading-relaxed">{q.question}</h2>

          {/* Answer textarea */}
          <div>
            <label className="block text-sm font-semibold mb-2">Your Answer</label>
            <textarea
              value={ans.text}
              onChange={e => setAnswers(prev => prev.map((a, i) => i === idx ? { ...a, text: e.target.value } : a))}
              rows={6}
              placeholder="Type your answer here… think of a structured response: Situation → Task → Action → Result"
              className="w-full bg-background border border-input rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
          </div>

          {/* Self-rating */}
          <div>
            <p className="text-sm font-semibold mb-2">How well did you answer? (optional)</p>
            <StarRating value={ans.rating} onChange={r => setAnswers(prev => prev.map((a, i) => i === idx ? { ...a, rating: r } : a))} />
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-border">
            {idx > 0 ? (
              <Button variant="outline" size="sm" onClick={() => setIdx(i => i - 1)} className="gap-1">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
            ) : <div />}
            <Button
              onClick={() => handleNext()}
              disabled={saving || finishing}
              className="gap-2"
            >
              {saving || finishing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {finishing ? 'Finishing…' : idx < total - 1 ? <><span>Next</span><ChevronRight className="w-4 h-4" /></> : <><CheckCircle2 className="w-4 h-4" /> Finish</>}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────
function ResultsScreen({ session, onRestart }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center py-8 space-y-3">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
          <Trophy className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-black">Interview Complete!</h2>
        <p className="text-muted-foreground">Here's how your mock PI went.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Questions', value: session.answers?.length },
          { label: 'Avg Rating', value: session.avgSelfRating ? `${session.avgSelfRating}/5` : '—' },
          { label: 'Time Spent', value: fmtTime(session.totalTimeTakenSeconds || 0) },
        ].map(s => (
          <div key={s.label} className="app-card p-4 text-center">
            <p className="text-2xl font-black">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="app-card p-6 space-y-4">
        <h3 className="font-bold text-base">Question-by-Question Review</h3>
        {session.answers?.map((a, i) => (
          <div key={i} className="border border-border rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold">{i + 1}. {a.questionText}</p>
            {a.userAnswer && <p className="text-sm text-muted-foreground bg-secondary/30 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">{a.userAnswer}</p>}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {a.selfRating && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {a.selfRating}/5</span>}
              {a.timeTakenSeconds && <span><Clock className="w-3 h-3 inline mr-0.5" />{fmtTime(a.timeTakenSeconds)}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Button variant="outline" onClick={onRestart}>Try Another Session</Button>
        <Link to="/mba/analytics"><Button className="gap-2"><BarChart2 className="w-4 h-4" /> View Analytics</Button></Link>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function MockInterviewSession() {
  const { user } = useAuthStore();
  const isPro = user?.subscription?.plan === 'pro';

  const [phase, setPhase] = useState('lobby'); // 'lobby' | 'session' | 'results'
  const [session, setSession] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(true);

  useEffect(() => {
    listMockInterviews()
      .then(res => { setHistory(res.data.data || []); setHistLoading(false); })
      .catch(() => setHistLoading(false));
  }, [phase]);

  const handleStart = async (count) => {
    const res = await startMockInterview(count);
    const { session: s, questions: q } = res.data.data;
    setSession(s);
    setQuestions(q);
    setPhase('session');
  };

  const handleFinish = (completedSession) => {
    setSession(completedSession);
    setPhase('results');
  };

  const handleRestart = () => {
    setSession(null);
    setQuestions([]);
    setPhase('lobby');
  };

  return (
    <div>
      <SEO title="Mock PI Interview | Prepster MBA" description="Practice Personal Interviews with timed questions and self-rating — built for IIM, XLRI, and top B-School placements." />
      {phase === 'lobby'   && <Lobby isPro={isPro} onStart={handleStart} history={history} histLoading={histLoading} />}
      {phase === 'session' && <ActiveSession session={session} questions={questions} onFinish={handleFinish} />}
      {phase === 'results' && <ResultsScreen session={session} onRestart={handleRestart} />}
    </div>
  );
}

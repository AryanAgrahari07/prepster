import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionResults as getSession, submitAnswer, finishSession } from '@/api/aptitude';
import { Button } from '@/components/ui/Button';
import { Clock, Flag } from 'lucide-react';
import toast from '@/utils/toast';

export default function QuizSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(null);
  // Track time per question: store the timestamp when question was rendered
  const questionStartTime = useRef(Date.now());

  useEffect(() => {
    getSession(id)
      .then(res => {
        const s = res.data.session;
        if (s.status === 'completed') {
          navigate(`/aptitude/results/${id}`, { replace: true });
          return;
        }
        setSession(s);
        // Pre-fill any existing answers from the session (handles page refresh)
        const initialAnswers = {};
        const initialFlagged = {};
        s.questions.forEach((q, idx) => {
          if (q.selectedOption) initialAnswers[idx] = q.selectedOption;
          if (q.flaggedForReview) initialFlagged[idx] = true;
        });
        setAnswers(initialAnswers);
        setFlagged(initialFlagged);

        if (s.timeLimitSeconds) {
          const elapsed = Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000);
          setTimeLeft(Math.max(0, s.timeLimitSeconds - elapsed));
        }

        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        navigate('/aptitude');
      });
  }, [id, navigate]);

  // Reset per-question timer whenever the user navigates to a new question
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [currentIndex]);

  // Use a ref for handleFinish to avoid stale closures in the interval
  const handleFinishRef = useRef();
  
  // Global test countdown timer
  useEffect(() => {
    if (submitting) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null) return null; // Wait until initialized by the fetch effect
        if (prev <= 1) {
          clearInterval(interval);
          if (handleFinishRef.current) handleFinishRef.current(true); // force auto-submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [submitting]);

  const formatTime = (secs) => {
    if (secs === null) return null;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading session...
      </div>
    );
  }
  if (!session) return null;

  const currentQ = session.questions[currentIndex];
  const questionData = currentQ?.questionId;
  const answeredCount = Object.keys(answers).length;

  const handleSelectOption = async (optionLabel) => {
    // Measure actual elapsed time since question was displayed
    const timeTakenSeconds = Math.round((Date.now() - questionStartTime.current) / 1000);

    setAnswers(prev => ({ ...prev, [currentIndex]: optionLabel }));

    try {
      const res = await submitAnswer(id, {
        questionId: questionData._id,
        selectedOption: optionLabel,
        timeTakenSeconds,
      });
      // Update session if adaptive engine swapped future questions
      if (res.data?.session) {
        setSession(res.data.session);
      }
    } catch (err) {
      console.error('Failed to submit answer', err);
    }
  };

  const handleFlag = async () => {
    const isFlagged = !flagged[currentIndex];
    setFlagged(prev => ({ ...prev, [currentIndex]: isFlagged }));
    try {
      await submitAnswer(id, {
        questionId: questionData._id,
        selectedOption: answers[currentIndex] || null, // preserve answer
        flaggedForReview: isFlagged,
        timeTakenSeconds: Math.round((Date.now() - questionStartTime.current) / 1000)
      });
    } catch (err) {
      console.error('Failed to update flag', err);
    }
  };

  const handleNavigate = (newIndex) => {
    setCurrentIndex(newIndex);
    // Timer resets via the useEffect above
  };

  const handleFinish = async (autoSubmit = false) => {
    if (!autoSubmit && !window.confirm(`You've answered ${answeredCount} of ${session.questions.length} questions. Submit the test?`)) return;
    try {
      setSubmitting(true);
      await finishSession(id);
      navigate(`/aptitude/results/${id}`, { replace: true });
    } catch (err) {
      console.error(err);
      if (!autoSubmit) setSubmitting(false);
    }
  };

  useEffect(() => {
    handleFinishRef.current = handleFinish;
  }, [handleFinish]);

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 sm:mb-8 pb-4 border-b border-border gap-3">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold capitalize text-primary truncate">
            {session.sessionType?.replace(/-/g, ' ')} Session
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Question {currentIndex + 1} of {session.questions.length}
            {' '}·{' '}
            <span className="text-primary">{answeredCount} answered</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {timeLeft !== null && (
            <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border font-bold font-mono text-base sm:text-lg ${
              timeLeft < 300 ? 'text-destructive border-destructive bg-destructive/10 animate-pulse' : 'text-foreground border-border bg-secondary/30'
            }`}>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              {formatTime(timeLeft)}
            </div>
          )}
          <Button variant="destructive" size="sm" className="text-xs sm:text-sm" onClick={() => handleFinish(false)} isLoading={submitting}>
            Submit
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-secondary/30 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300 rounded-full"
          style={{ width: `${(answeredCount / session.questions.length) * 100}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col">
        <div className="bg-secondary/20 p-4 sm:p-6 rounded-xl border border-border mb-6 sm:mb-8 relative">
          <button 
            onClick={handleFlag}
            className={`absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-lg transition-colors ${flagged[currentIndex] ? 'bg-yellow-500/20 text-yellow-500' : 'text-muted-foreground hover:bg-secondary'}`}
            title="Flag for review"
          >
            <Flag className="w-4 h-4 sm:w-5 sm:h-5" fill={flagged[currentIndex] ? "currentColor" : "none"} />
          </button>
          <p className="text-sm sm:text-lg font-medium whitespace-pre-wrap leading-relaxed pr-8 sm:pr-10">
            {questionData?.text}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3 sm:space-y-4 flex-1">
          {questionData?.options?.map((opt) => (
            <button
              key={opt.label}
              id={`option-${opt.label}`}
              onClick={() => handleSelectOption(opt.label)}
              className={`w-full flex items-center p-3 sm:p-4 rounded-xl border text-left transition-all ${
                answers[currentIndex] === opt.label
                  ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary'
                  : 'border-border bg-secondary/10 text-muted-foreground hover:bg-secondary/30 hover:text-foreground hover:border-muted-foreground/50'
              }`}
            >
              <span className={`flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md font-bold mr-3 sm:mr-4 shrink-0 text-sm ${
                answers[currentIndex] === opt.label
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground'
              }`}>
                {opt.label}
              </span>
              <span className="text-sm sm:text-base">{opt.text}</span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6 sm:mt-8 pt-4 border-t border-border gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === 0}
            onClick={() => handleNavigate(currentIndex - 1)}
            className="shrink-0"
          >
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </Button>

          <div className="flex gap-1 overflow-x-auto px-2 max-w-[55%]">
            {session.questions.map((_, idx) => (
              <button
                key={idx}
                id={`nav-q-${idx + 1}`}
                onClick={() => handleNavigate(idx)}
                className={`w-7 h-7 sm:w-8 sm:h-8 shrink-0 rounded-md flex items-center justify-center text-xs font-medium transition-colors ${
                  currentIndex === idx
                    ? 'ring-2 ring-primary ring-offset-2 ring-offset-background bg-secondary text-foreground'
                    : answers[idx]
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-secondary/30 text-muted-foreground border border-border hover:bg-secondary/50'
                }`}
              >
                <span className="relative z-10">{idx + 1}</span>
                {flagged[idx] && <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-500 rounded-full z-20" />}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={currentIndex === session.questions.length - 1}
            onClick={() => handleNavigate(currentIndex + 1)}
            className="shrink-0"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

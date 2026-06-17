import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSessionResults } from '@/api/aptitude';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, MinusCircle, ArrowRight, BarChart3 } from 'lucide-react';

export default function QuizResult() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSessionResults(id).then(res => {
      setSession(res.data.session);
      setLoading(false);
    }).catch(console.error);
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading results...</div>;
  if (!session) return <div className="p-8 text-center text-destructive">Failed to load session.</div>;

  const { score } = session;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 text-primary mb-4">
          <BarChart3 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Session Complete!</h1>
        <p className="text-muted-foreground mt-2">Here is how you performed in this {session.sessionType} session.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-secondary/20 border border-border p-4 sm:p-6 rounded-xl text-center">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Score</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{score.totalMarks}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 p-4 sm:p-6 rounded-xl text-center">
          <p className="text-xs sm:text-sm font-medium text-green-600/70 mb-1">Correct</p>
          <p className="text-2xl sm:text-3xl font-bold text-green-500">{score.correct}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 p-4 sm:p-6 rounded-xl text-center">
          <p className="text-xs sm:text-sm font-medium text-red-600/70 mb-1">Incorrect</p>
          <p className="text-2xl sm:text-3xl font-bold text-red-500">{score.incorrect}</p>
        </div>
        <div className="bg-secondary/20 border border-border p-4 sm:p-6 rounded-xl text-center">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Accuracy</p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground">{Math.round(score.percentage)}%</p>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-bold">Detailed Analysis</h2>
        {session.questions.map((q, idx) => {
          const { questionId: qData, selectedOption, isCorrect } = q;
          return (
            <div key={q._id} className="bg-secondary/10 border border-border rounded-xl p-6">
              <div className="flex gap-4">
                <div className="mt-1 shrink-0">
                  {selectedOption === null ? (
                    <MinusCircle className="w-6 h-6 text-muted-foreground" />
                  ) : isCorrect ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider mb-2 block">Question {idx + 1}</span>
                    <p className="text-base font-medium whitespace-pre-wrap">{qData?.text || 'Question text unavailable (it may have been replaced by the adaptive engine)'}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {qData?.options?.map((opt) => (
                      <div 
                        key={opt.label}
                        className={`flex items-center p-3 rounded-lg border ${
                          opt.label === qData.correctOption ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                          opt.label === selectedOption && !isCorrect ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                          'bg-background border-border text-muted-foreground'
                        }`}
                      >
                        <span className="font-bold mr-3">{opt.label}</span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>

                  {qData?.explanation && (
                    <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg mt-4">
                      <p className="text-sm font-semibold text-primary mb-1">Explanation</p>
                      <p className="text-sm text-muted-foreground">{qData.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 pt-8">
        <Link to="/aptitude">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">
            Back to Practice Hub
          </Button>
        </Link>
        <Link to="/dashboard">
          <Button size="lg" className="w-full sm:w-auto">
            Practice Weak Areas <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

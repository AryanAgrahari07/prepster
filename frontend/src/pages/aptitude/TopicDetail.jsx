import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTopics, startSession } from '@/api/aptitude';
import { APTITUDE_TOPICS, CS_TOPICS, DIFF_CONFIG } from './PracticeHub';
import { SUBTOPIC_LABELS } from '@/constants';
import { ArrowLeft, BookOpen } from 'lucide-react';
import toast from '@/utils/toast';
import useAuthStore from '@/store/authStore';

export default function TopicDetail() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [topicData, setTopicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Combine config
  const config = APTITUDE_TOPICS[topicId] || CS_TOPICS[topicId];

  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }
    
    getTopics()
      .then(res => {
        const data = (res.data.topics || []).find(t => t.topic === topicId);
        if (data) {
          setTopicData({ count: data.count, subTopics: data.subTopics || [] });
        } else {
          setTopicData({ count: 0, subTopics: [] });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [topicId, config]);

  const handleStartPractice = async (difficulty, subTopic) => {
    if (!user) {
      toast.error('Please log in to start practicing');
      return navigate('/auth/login');
    }
    
    try {
      setStarting(true);
      const res = await startSession({ 
        sessionType: 'practice', 
        topic: topicId, 
        subTopic: subTopic || undefined, 
        difficulty, 
        limit: 10 
      });
      navigate(`/aptitude/session/${res.data.sessionId}`);
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to start session');
      setStarting(false);
    }
  };

  if (!config) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h1 className="text-2xl font-bold">Topic Not Found</h1>
        <Link to="/aptitude" className="text-primary hover:underline text-sm font-medium">
          ← Back to Practice Hub
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="space-y-6">
        <button
          onClick={() => navigate('/aptitude')}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Practice Hub
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <span className="text-4xl shrink-0">{config.icon}</span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {config.label}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm sm:text-base leading-relaxed">{config.desc}</p>
            </div>
          </div>
          
          <div className="app-card p-4 text-center shrink-0 sm:min-w-[120px]">
            <p className="text-3xl font-extrabold text-primary">
              {loading ? '...' : (topicData?.count || 0)}
            </p>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1">Questions</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="app-card h-48 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          
          {(!topicData || topicData.subTopics.length === 0) ? (
            <div className="text-center py-20 app-card border-dashed">
              <span className="text-4xl mb-4 block">📭</span>
              <h3 className="text-lg font-bold mb-2">No questions yet</h3>
              <p className="text-muted-foreground text-sm">Check back later for new content in this topic.</p>
            </div>
          ) : (
            <>
              {/* Mixed Practice Banner */}
              <div className="app-card p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-primary/20 bg-primary/5">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-6 h-6 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Mixed Practice Session</h3>
                    <p className="text-muted-foreground text-sm mt-1">
                      Challenge yourself with a randomized mix of all subtopics to simulate real exam scenarios.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0 w-full lg:w-auto">
                  {DIFF_CONFIG.map(d => (
                    <button
                      key={d.key}
                      onClick={() => handleStartPractice(d.key, '')}
                      disabled={starting || topicData.count === 0}
                      className={`flex-1 lg:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold border ${d.border} ${d.color} bg-card hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtopics Grid */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-5">Focus on Subtopics</h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {topicData.subTopics.map((st) => (
                    <div
                      key={st.name}
                      className="app-card p-5 flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-5">
                        <h3 className="font-bold text-base text-card-foreground capitalize leading-tight">
                          {SUBTOPIC_LABELS[st.name] || st.name.replace(/_/g, ' ')}
                        </h3>
                        <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                          {st.count} Qs
                        </span>
                      </div>
                      
                      <div className="mt-auto pt-4 border-t border-border">
                        <p className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground mb-3">Select Difficulty</p>
                        <div className="flex gap-2">
                          {DIFF_CONFIG.map(d => (
                            <button
                              key={d.key}
                              onClick={() => handleStartPractice(d.key, st.name)}
                              disabled={starting || st.count === 0}
                              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold bg-secondary hover:bg-secondary/80 ${d.hover} transition-colors disabled:opacity-30 disabled:cursor-not-allowed`}
                              title={`Start ${d.label} ${st.name} test`}
                            >
                              {d.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { TRACKS, ROADMAP_DATA } from '@/constants/roadmaps';
import { ArrowLeft, ExternalLink, BookOpen, ChevronDown, ChevronUp, Clock, Briefcase, LayoutList, PlayCircle } from 'lucide-react';
import { useState } from 'react';
import SEO from '@/components/seo/SEO';

const LEVEL_COLORS = {
  Beginner:     { bg: 'bg-green-500/10',  border: 'border-green-500/20', text: 'text-green-600 dark:text-green-400',  dot: 'bg-green-500' },
  Intermediate: { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',  text: 'text-blue-600 dark:text-blue-400',   dot: 'bg-blue-500' },
  Advanced:     { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-600 dark:text-purple-400', dot: 'bg-purple-500' },
};

function StepCard({ step, isLast, phaseColor, delayIdx }) {
  const [open, setOpen] = useState(false);
  const colors = LEVEL_COLORS[phaseColor] || LEVEL_COLORS.Beginner;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delayIdx * 0.05 }}
      className="relative flex gap-6 group/step"
    >
      {/* Clean Timeline line */}
      {!isLast && (
        <div className="absolute left-[11px] top-8 bottom-[-16px] w-[2px] bg-border" />
      )}

      {/* Clean Dot */}
      <div className={`w-6 h-6 rounded-full border-2 ${colors.border} bg-background flex items-center justify-center shrink-0 mt-1 z-10`}>
        <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
      </div>

      {/* Clean Card */}
      <div className="flex-1 mb-10">
        <button
          onClick={() => setOpen(!open)}
          className={`w-full text-left bg-card border ${open ? 'border-border shadow-sm' : 'border-transparent hover:border-border/60 hover:bg-secondary/20'} rounded-2xl p-5 transition-all duration-200`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-bold text-lg text-foreground transition-colors">{step.title}</h4>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{step.description}</p>
            </div>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${open ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}>
              {open ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </div>

          <AnimatePresence>
            {open && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-5 pt-5 border-t border-border space-y-6">
                  {/* Topics */}
                  {step.topics?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-3">Topics to cover</p>
                      <div className="flex flex-wrap gap-2">
                        {step.topics.map(t => (
                          <span key={t} className="text-sm font-medium bg-secondary/60 px-3 py-1.5 rounded-lg text-secondary-foreground">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {step.resources?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground mb-3">Recommended Resources</p>
                      <div className="flex flex-col gap-2.5">
                        {step.resources.map(r => (
                          <a
                            key={r.label}
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline group/link w-fit"
                          >
                            <PlayCircle className="w-4 h-4" />
                            {r.label}
                            <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover/link:opacity-100 transition-opacity ml-1" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  );
}

function PhaseSection({ phase }) {
  const colors = LEVEL_COLORS[phase.level] || LEVEL_COLORS.Beginner;

  return (
    <div className="space-y-8">
      {/* Clean Phase header */}
      <div className="flex items-center gap-4">
        <div className={`px-4 py-2 rounded-xl text-sm font-bold border ${colors.bg} ${colors.border} ${colors.text}`}>
          {phase.phase} <span className="opacity-40 mx-1">/</span> {phase.level}
        </div>
        <div className="flex-1 h-[1px] bg-border" />
        <span className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <Clock className="w-4 h-4" /> {phase.duration}
        </span>
      </div>

      {/* Steps */}
      <div className="pl-1 md:pl-2">
        {phase.steps?.map((step, idx) => (
          <StepCard
            key={step.title}
            step={step}
            isLast={idx === phase.steps.length - 1}
            phaseColor={phase.level}
            delayIdx={idx}
          />
        ))}
      </div>
    </div>
  );
}

export default function RoadmapDetail() {
  const { track: trackId } = useParams();
  const navigate = useNavigate();

  const track = TRACKS.find(t => t.id === trackId);
  const roadmap = ROADMAP_DATA[trackId];

  if (!track || !roadmap) {
    return (
      <div className="max-w-2xl mx-auto text-center py-32 space-y-4">
        <h1 className="text-2xl font-bold">Roadmap not found</h1>
        <p className="text-muted-foreground">The track you are looking for doesn't exist.</p>
        <button onClick={() => navigate('/roadmap')} className="text-primary hover:underline text-sm mt-4">
          Return to roadmaps
        </button>
      </div>
    );
  }

  const totalSteps = roadmap.phases.reduce((sum, p) => sum + (p.steps?.length || 0), 0);

  return (
    <div className="max-w-3xl mx-auto space-y-16 pb-24 mt-8 px-4 sm:px-6">
      <SEO 
        title={`${track.title} Roadmap | Prepster`} 
        description={`Follow our comprehensive step-by-step ${track.title} roadmap. Learn the skills you need for your tech career.`}
        keywords={`${track.title} learning path, ${track.title} career roadmap, tech skills, placement roadmap`}
        url={`https://prepster.in/roadmap/${trackId}`}
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemPage",
          "name": `${track.title} Roadmap`,
          "url": `https://prepster.in/roadmap/${trackId}`,
          "description": track.description
        }}
      />
      {/* Minimalist Hero */}
      <div className="space-y-8">
        <button
          onClick={() => navigate('/roadmap')}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to roadmaps
        </button>

        <div className="flex items-start gap-6">
          <div className="w-20 h-20 shrink-0 rounded-[20px] bg-secondary flex items-center justify-center text-4xl border border-border">
            {track.icon}
          </div>
          <div className="space-y-3 flex-1 pt-1">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{track.title}</h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">{track.description}</p>
          </div>
        </div>

        {/* Clean Meta Strip */}
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-6 border-t border-border">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Clock className="w-4 h-4 text-muted-foreground" /> {track.duration} duration
          </span>
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <BookOpen className="w-4 h-4 text-muted-foreground" /> {roadmap.phases.length} phases
          </span>
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Briefcase className="w-4 h-4 text-muted-foreground" /> {totalSteps} milestones
          </span>
        </div>
      </div>

      {/* Learning Path */}
      <div className="space-y-12 pt-8">
        <h2 className="text-2xl font-bold tracking-tight">Curriculum</h2>
        <div className="space-y-16">
          {roadmap.phases.map((phase) => (
            <PhaseSection key={phase.phase} phase={phase} />
          ))}
        </div>
      </div>

      {/* Clean Bottom CTA */}
      <div className="rounded-[32px] bg-primary text-primary-foreground p-8 md:p-12 flex flex-col sm:flex-row items-center justify-between gap-8 mt-16">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-2xl font-bold">Ready to apply this?</h3>
          <p className="text-primary-foreground/80">
            Practice {track.practiceTopics?.map(t => t.toUpperCase()).join(', ')} in the Hub.
          </p>
        </div>
        <Link
          to="/aptitude"
          className="inline-flex items-center gap-3 bg-background text-foreground px-6 py-3.5 rounded-2xl text-sm font-bold hover:bg-secondary transition-colors shrink-0"
        >
          <LayoutList className="w-5 h-5" />
          Start Practice
        </Link>
      </div>

    </div>
  );
}

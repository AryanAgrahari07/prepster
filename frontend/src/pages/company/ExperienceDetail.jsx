import { useParams, Link, useLocation, Navigate } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, Share2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import SEO from '@/components/seo/SEO';
import toast from '@/utils/toast';

// Smart formatter: detects rounds, numbered items, TR/MR/HR sections
function ExperienceRenderer({ content }) {
  if (!content) return null;

  const lines = content
    .replace(/(\d+\.\s+)/g, '\n$1')
    .replace(/(Round\s*[-–]?\s*\d+\s*[:\-–]?\s*)/gi, '\n\n**$1**\n')
    .replace(/(Technical Round|Technical Interview|Tech Round)/gi, '\n\n**$1:**\n')
    .replace(/(Managerial Round|MR Round|Managerial Interview)/gi, '\n\n**$1:**\n')
    .replace(/(HR Round|HR Interview|Human Resource)/gi, '\n\n**$1:**\n')
    .replace(/(Aptitude Round|Online Test|Written Test|Aptitude Test)/gi, '\n\n**$1:**\n')
    .replace(/(TR\s*[&:]\s*|MR\s*[&:]\s*)/gi, '\n\n**$1**\n')
    .split('\n');

  return (
    <div className="space-y-2.5 sm:space-y-3 text-[13px] sm:text-[15px] text-foreground/90 leading-[1.8] sm:leading-[1.85]">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Section heading (wrapped in **)
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          const label = trimmed.replace(/\*\*/g, '').replace(/:$/, '');
          return (
            <div key={i} className="flex items-center gap-2 mt-5 sm:mt-7 mb-1">
              <div className="w-1 h-5 sm:h-6 rounded-full bg-primary shrink-0" />
              <p className="text-primary font-bold text-xs sm:text-sm uppercase tracking-widest">{label}</p>
            </div>
          );
        }

        // Numbered list item
        if (/^\d+\./.test(trimmed)) {
          const num = trimmed.match(/^(\d+)/)[1];
          const text = trimmed.replace(/^\d+\.\s*/, '');
          return (
            <div key={i} className="flex gap-2.5 sm:gap-3 items-start">
              <span className="shrink-0 mt-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary text-[10px] sm:text-xs font-bold flex items-center justify-center">
                {num}
              </span>
              <p>{text}</p>
            </div>
          );
        }

        // Regular paragraph
        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
}

export default function ExperienceDetail() {
  const { slug, idx } = useParams();
  const location = useLocation();

  const { experience, companyName, companyLogo } = location.state || {};

  // If navigated here directly without state, bounce back
  if (!experience) {
    return <Navigate to={`/companies/${slug}`} replace />;
  }

  const dateStr = experience.dateScraped
    ? new Date(experience.dateScraped).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : 'Date not available';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${companyName} Interview Experience | Prepster`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <article className="max-w-4xl mx-auto pb-16 sm:pb-20 px-3 sm:px-4 md:px-6 lg:px-8">
      <SEO
        title={`${companyName} Interview Experience | Prepster`}
        description={`Real ${companyName} interview experience shared by a student. Round-by-round breakdown of aptitude, technical, and HR rounds.`}
        keywords={`${companyName} interview experience, ${companyName} placement, ${companyName} HR round, ${companyName} technical interview`}
        url={`https://prepster.in/companies/${slug}/experiences/${idx}`}
      />

      {/* ── Back link ───────────────────────────────────────── */}
      <Link
        to={`/companies/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-4 sm:mt-6 mb-6 sm:mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {companyName}
      </Link>

      {/* ── Hero Header ─────────────────────────────────────── */}
      <header className="mb-6 sm:mb-10">
        {/* Company badge row */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center shrink-0">
            {companyLogo
              ? <img src={companyLogo} alt={companyName} className="w-7 h-7 sm:w-10 sm:h-10 object-contain" />
              : <Building2 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
            }
          </div>
          <div>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary mb-1">
              {companyName}
            </p>
            <span className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs bg-primary/10 text-primary px-2 sm:px-2.5 py-0.5 rounded-full font-semibold border border-primary/20">
              <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              Interview Experience
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground leading-tight mb-3 sm:mb-4">
          {experience.title || 'Campus Placement Interview Experience'}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            {dateStr}
          </span>
          <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
          <span className="flex items-center gap-1 sm:gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 shrink-0" />
            Verified experience
          </span>
          <span className="w-1 h-1 rounded-full bg-border hidden sm:block" />
          <button
            onClick={handleShare}
            className="flex items-center gap-1 sm:gap-1.5 font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Share
          </button>
        </div>
      </header>

      {/* ── Gradient divider ────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-primary/40 via-border to-transparent mb-6 sm:mb-10" />

      {/* ── Round chips ─────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-10">
        {['Aptitude', 'Technical', 'HR Round'].map(tag => (
          <span
            key={tag}
            className="text-[10px] sm:text-xs font-semibold bg-secondary text-muted-foreground px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-border"
          >
            {tag}
          </span>
        ))}
        <span className="text-[10px] sm:text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-green-500/20">
          Campus Placement
        </span>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="bg-secondary/5 border border-border rounded-2xl sm:rounded-3xl p-4 sm:p-7 md:p-10 shadow-sm">
        <ExperienceRenderer content={experience.content} />
      </div>

      {/* ── Footer CTA ──────────────────────────────────────── */}
      <div className="mt-8 sm:mt-10 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center space-y-2 sm:space-y-3">
        <p className="text-base sm:text-lg font-bold text-foreground">
          Preparing for {companyName}?
        </p>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
          Practice with company-specific questions, mock tests, and round-by-round guides.
        </p>
        <Link to={`/companies/${slug}`} className="inline-block w-full sm:w-auto mt-3 sm:mt-4">
          <Button className="w-full sm:w-auto font-semibold px-6 sm:px-8 text-sm h-auto py-3 sm:py-2.5 whitespace-normal">
            Go to {companyName} Prep Track →
          </Button>
        </Link>
      </div>
    </article>
  );
}

import { useParams, Link, useLocation, Navigate } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarDays, Share2, MessageSquare, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import SEO from '@/components/seo/SEO';
import toast from '@/utils/toast';

// Nicely formats the raw scraped text: split by numbered points, bold labels, etc.
function ExperienceRenderer({ content }) {
  if (!content) return null;

  // Split at common interview section separators to make structured paragraphs
  const lines = content
    .replace(/(\d+\.\s+)/g, '\n$1')          // newline before numbered items
    .replace(/(Round[-\s]\d+[:\s])/gi, '\n\n**$1**\n') // highlight Round headers
    .replace(/(TR\s*[&:]\s*|MR\s*[&:]\s*|HR\s*[&:]\s*)/gi, '\n\n**$1**\n') // TR/MR/HR
    .split('\n');

  return (
    <div className="space-y-3 text-[15px] text-foreground/90 leading-[1.85]">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        // Bold headings (wrapped in **)
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          const label = trimmed.replace(/\*\*/g, '');
          return (
            <p key={i} className="text-primary font-bold text-base mt-6 mb-1 uppercase tracking-wide">
              {label}
            </p>
          );
        }

        // Numbered list item
        if (/^\d+\./.test(trimmed)) {
          return (
            <div key={i} className="flex gap-3 items-start">
              <span className="shrink-0 mt-1 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                {trimmed.match(/^(\d+)/)[1]}
              </span>
              <p>{trimmed.replace(/^\d+\.\s*/, '')}</p>
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

  // Data comes from React Router state set in CompanyTrack
  const { experience, companyName, companyLogo, companySlug } = location.state || {};

  // If someone navigates here directly without state, bounce back
  if (!experience) {
    return <Navigate to={`/companies/${slug}`} replace />;
  }

  const dateStr = experience.dateScraped
    ? new Date(experience.dateScraped).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
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
    <article className="max-w-4xl mx-auto pb-20 px-4 sm:px-6 lg:px-8">
      <SEO
        title={`${companyName} Interview Experience | Prepster`}
        description={`Real ${companyName} interview experience shared by a student. Round-by-round breakdown of aptitude, technical, and HR rounds.`}
        keywords={`${companyName} interview experience, ${companyName} placement, ${companyName} HR round, ${companyName} technical interview`}
        url={`https://prepster.in/companies/${slug}/experiences/${idx}`}
      />

      {/* ── Back link ─────────────────────────────────────────── */}
      <Link
        to={`/companies/${slug}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mt-6 mb-10"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to {companyName}
      </Link>

      {/* ── Hero header ───────────────────────────────────────── */}
      <header className="mb-10">
        {/* Company badge row */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center shrink-0">
            {companyLogo ? (
              <img src={companyLogo} alt={companyName} className="w-10 h-10 object-contain" />
            ) : (
              <Building2 className="w-7 h-7 text-primary" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-primary mb-0.5">
              {companyName}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold border border-primary/20">
              <MessageSquare className="w-3 h-3" />
              Interview Experience
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight mb-4">
          {experience.title || 'Campus Placement Interview Experience'}
        </h1>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-4 h-4 shrink-0" />
            {dateStr}
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
            Verified real experience
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </header>

      {/* ── Divider ───────────────────────────────────────────── */}
      <div className="h-px bg-gradient-to-r from-primary/40 via-border to-transparent mb-10" />

      {/* ── Quick info chips ──────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-10">
        {['Aptitude Round', 'Technical Round', 'HR Round'].map(tag => (
          <span
            key={tag}
            className="text-xs font-semibold bg-secondary text-muted-foreground px-3 py-1.5 rounded-full border border-border"
          >
            {tag}
          </span>
        ))}
        <span className="text-xs font-semibold bg-green-500/10 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full border border-green-500/20">
          Campus Placement
        </span>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="bg-secondary/5 border border-border rounded-3xl p-6 sm:p-10 shadow-sm">
        <ExperienceRenderer content={experience.content} />
      </div>

      {/* ── Footer CTA ───────────────────────────────────────── */}
      <div className="mt-10 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-8 text-center space-y-3">
        <p className="text-lg font-bold text-foreground">
          Preparing for {companyName}?
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Practice with company-specific questions, mock tests, and round-by-round guides.
        </p>
        <Link to={`/companies/${slug}`}>
          <Button className="mt-2 font-semibold px-8">
            Go to {companyName} Prep Track →
          </Button>
        </Link>
      </div>
    </article>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TRACKS } from '@/constants/roadmaps';
import { ArrowRight, Clock, Briefcase, Map, LayoutList, CheckCircle2 } from 'lucide-react';
import { AdPlaceholder } from '@/components/ui/AdPlaceholder';
import SEO from '@/components/seo/SEO';

export default function Roadmap() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
  };

  return (
    <div className="max-w-7xl mx-auto pb-24 px-4 sm:px-6 lg:px-8 space-y-16 mt-8">
      <SEO 
        title="Tech Career Roadmaps | Prepster" 
        description="Step-by-step career roadmaps for Software Engineering, Frontend, Backend, and Data Science."
        keywords="software engineering roadmap, frontend developer roadmap, backend developer roadmap, data science career path, tech career guides"
        url="https://prepster.in/roadmap"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Tech Career Roadmaps",
          "url": "https://prepster.in/roadmap",
          "description": "Step-by-step career roadmaps for Software Engineering, Frontend, Backend, and Data Science."
        }}
      />
      {/* Clean Hero Section */}
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
          <Map className="w-8 h-8 text-primary" strokeWidth={1.5} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
          Career Roadmaps
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
          Step-by-step learning paths curated for modern tech roles. 
          Follow a structured journey from absolute beginner to job-ready professional.
        </p>
      </div>

      <AdPlaceholder slot="9265516467" className="h-[90px] max-w-4xl mx-auto mb-8" />

      {/* Grid Section */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-6">Select your path</h2>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {TRACKS.map(track => (
            <motion.div key={track.id} variants={itemVariants} className="h-full">
              <Link
                to={`/roadmap/${track.id}`}
                className="group flex flex-col h-full bg-card border border-border/60 rounded-[24px] p-7 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="text-4xl">
                    {track.icon}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-grow space-y-2">
                  <h3 className="font-bold text-xl text-card-foreground group-hover:text-primary transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {track.description}
                  </p>
                </div>

                {/* Meta details */}
                <div className="flex items-center gap-4 text-[13px] font-medium text-muted-foreground mt-6 pt-5 border-t border-border/40">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {track.duration}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    {track.roles.length} roles
                  </span>
                </div>

                {/* Roles Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {track.roles.slice(0, 2).map(r => (
                    <span key={r} className="text-[11px] font-semibold px-3 py-1 rounded-full bg-secondary text-secondary-foreground">
                      {r}
                    </span>
                  ))}
                  {track.roles.length > 2 && (
                    <span className="text-[11px] font-medium text-muted-foreground px-3 py-1 rounded-full bg-secondary/50">
                      +{track.roles.length - 2}
                    </span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Clean Bottom CTA */}
      <div className="rounded-[32px] bg-primary text-primary-foreground p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 mt-12">
        <div className="space-y-3 text-center md:text-left max-w-2xl">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">Ready to test your skills?</h3>
          <p className="text-primary-foreground/80 text-lg">
            Roadmaps guide your learning, but practice makes you perfect. 
            Jump into our Practice Hub to evaluate yourself.
          </p>
        </div>
        
        <Link
          to="/aptitude"
          className="inline-flex items-center gap-3 bg-background text-foreground px-8 py-4 rounded-2xl text-base font-bold hover:bg-secondary hover:scale-105 transition-all shrink-0"
        >
          <LayoutList className="w-5 h-5" />
          Go to Practice Hub
        </Link>
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Zap, Users, Target, Heart, Globe, Award, Briefcase,
  GraduationCap, ArrowRight, Building2, Code2, Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import SEO from '@/components/seo/SEO';

const SectionReveal = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const VALUES = [
  {
    icon: Target,
    title: 'Student-First',
    description: 'Every decision we make starts with "Does this help a student get placed?" If the answer isn\'t yes, we don\'t build it.',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: Heart,
    title: 'Accessible to All',
    description: 'We believe Tier 2/3 students deserve the same preparation quality as IITs. Our pricing reflects that belief — starting at just ₹99/month.',
    gradient: 'from-rose-500 to-pink-600',
  },
  {
    icon: Lightbulb,
    title: 'Data-Driven Prep',
    description: 'No guesswork. Our analytics engine identifies exactly where you\'re weak and guides you to improve systematically.',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: Globe,
    title: 'Built in India',
    description: 'We understand Indian placement culture — from mass hiring drives to CGPA cutoffs. The platform is purpose-built for this ecosystem.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

const TEAM = [
  {
    name: 'Dinz Software Team',
    role: 'Engineering & Product',
    description: 'A passionate team of developers, designers, and product thinkers building the future of placement preparation.',
    avatar: 'DS',
    gradient: 'from-violet-500 to-purple-600',
  },
];

const MILESTONES = [
  { year: '2024', title: 'Idea Born', description: 'Identified the gap in placement prep for Tier 2/3 students.' },
  { year: '2024', title: 'Development Starts', description: 'Built the first version of the adaptive quiz engine and company tracks.' },
  { year: '2025', title: 'Beta Launch', description: 'Launched beta with 5,000+ questions and 10 company tracks.' },
  { year: '2025', title: 'Growing Fast', description: '50,000+ students joined. Expanded to 100+ company tracks and 25,000+ questions.' },
];

export default function About() {
  return (
    <div>
      <SEO
        title="About Us"
        description="Learn about Prepster by Dinz Software — India's #1 placement preparation platform built for engineering and MBA students."
        keywords="about prepster, dinz software, placement preparation platform, edtech india"
        url="https://prepster.in/about"
      />

      {/* Hero */}
      <section className="relative pt-24 pb-16 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/8 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <SectionReveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-primary mb-6">
              <span className="w-8 h-px bg-primary/50" />
              Our Story
              <span className="w-8 h-px bg-primary/50" />
            </span>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Democratizing placement<br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                preparation for India
              </span>
            </h1>
          </SectionReveal>

          <SectionReveal delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Prepster is built by <span className="text-foreground font-semibold">Dinz Software Pvt. Ltd.</span> — 
              a team that believes every student, regardless of their college tier, deserves a fair shot at getting placed.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <SectionReveal>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary mb-4 block">Our Mission</span>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Bridge the placement gap between Tier 1 and Tier 2/3 colleges
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Students from IITs and NITs have access to seniors, alumni networks, and curated preparation resources.
                  Students from Tier 2/3 colleges? They rely on ad-heavy websites, scattered YouTube videos, and outdated PDFs.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We built Prepster to change that. One platform with <span className="text-foreground font-medium">25,000+ adaptive questions</span>, 
                  <span className="text-foreground font-medium"> 100+ company-specific tracks</span>, real-time analytics, and a curated job feed — 
                  everything a student needs to go from zero preparation to an offer letter.
                </p>
              </div>
            </SectionReveal>

            <SectionReveal delay={0.1}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '25,000+', label: 'Questions', icon: Code2 },
                  { value: '100+', label: 'Companies', icon: Building2 },
                  { value: '50,000+', label: 'Students', icon: Users },
                  { value: '92%', label: 'Placement Rate', icon: Award },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-6 text-center hover:border-primary/20 transition-all duration-300">
                    <stat.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                    <p className="text-2xl md:text-3xl font-bold font-display">{stat.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </SectionReveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <SectionReveal className="text-center mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary mb-4 block">Our Values</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">What drives us</h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((value, i) => (
              <SectionReveal key={value.title} delay={i * 0.08}>
                <div className="group bg-card/20 backdrop-blur-sm border border-border/30 rounded-3xl p-7 hover:border-primary/20 transition-all duration-500">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionReveal className="text-center mb-16">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-primary mb-4 block">Our Journey</span>
            <h2 className="font-display text-3xl md:text-4xl font-bold">From idea to 50,000+ students</h2>
          </SectionReveal>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/30 via-primary/10 to-transparent" />

            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <SectionReveal key={i} delay={i * 0.1}>
                  <div className="relative flex items-start gap-6 pl-2">
                    <div className="relative z-10 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                      <div className="w-2.5 h-2.5 rounded-full bg-white" />
                    </div>
                    <div className="pb-2">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">{m.year}</span>
                      <h3 className="font-display text-lg font-bold mt-1">{m.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{m.description}</p>
                    </div>
                  </div>
                </SectionReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-gradient-to-br from-primary/15 via-purple-500/10 to-blue-500/15 p-10 md:p-14 text-center">
              <div className="absolute top-0 left-1/4 w-60 h-60 bg-primary/15 rounded-full blur-[100px]" />
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 relative">
                Join the Prepster family
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto relative">
                Start your placement preparation journey today. It's free to get started.
              </p>
              <Link to="/auth/register">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 border-0 h-12 px-8 font-bold rounded-xl shadow-lg shadow-primary/20">
                  Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}

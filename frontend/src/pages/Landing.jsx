import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import {
  BookOpen, Briefcase, BarChart3, Building2, CheckCircle2,
  ArrowRight, Star, Zap, Users, Menu, X,
  Target, Brain, Rocket, Trophy, ChevronRight, Sparkles,
  GraduationCap, Shield, Play, Crown, Check, Clock,
  TrendingUp, Flame, Award, BadgeCheck, MousePointerClick
} from 'lucide-react';
import { motion, AnimatePresence, useInView, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';
import SEO from '@/components/seo/SEO';
import ThemeToggle from '@/components/ui/ThemeToggle';

/* ═══════════════════════════════════════════
   ANIMATED COUNTER — easeOut count-up
   ═══════════════════════════════════════════ */
function AnimatedCounter({ value, prefix = '', suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      setCount(Math.floor(eased * value));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}{count.toLocaleString('en-IN')}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════
   MOUSE GLOW — cursor-following radial light
   ═══════════════════════════════════════════ */
function MouseGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 50, damping: 20 });
  const springY = useSpring(y, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const handler = (e) => { x.set(e.clientX); y.set(e.clientY); };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, [x, y]);

  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-30 hidden lg:block"
      style={{
        background: useTransform(
          [springX, springY],
          ([px, py]) => `radial-gradient(600px circle at ${px}px ${py}px, rgba(139,92,246,0.06), transparent 60%)`
        ),
      }}
    />
  );
}

/* ═══════════════════════════════════════════
   AURORA ORB — animated gradient sphere
   ═══════════════════════════════════════════ */
function AuroraOrb({ className = '' }) {
  return (
    <div className={`absolute pointer-events-none ${className}`}>
      <div className="relative w-full h-full">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-600/30 via-blue-500/20 to-cyan-400/30 blur-[80px] animate-pulse-glow" />
        <div className="absolute inset-[15%] rounded-full bg-gradient-to-tr from-purple-500/25 to-pink-500/20 blur-[60px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-[30%] rounded-full bg-gradient-to-bl from-blue-400/20 to-indigo-500/25 blur-[40px] animate-float" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   3D TILT CARD — interactive perspective hover
   ═══════════════════════════════════════════ */
function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setRotateX((y - 0.5) * -12);
    setRotateY((x - 0.5) * 12);
    setGlowPos({ x: x * 100, y: y * 100 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setRotateX(0);
    setRotateY(0);
    setGlowPos({ x: 50, y: 50 });
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative transition-transform duration-200 ease-out ${className}`}
      style={{
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Border glow following cursor */}
      <div
        className="absolute -inset-px rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(400px circle at ${glowPos.x}% ${glowPos.y}%, rgba(139,92,246,0.3), transparent 60%)`,
        }}
      />
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════
   TYPING TEXT — typewriter effect
   ═══════════════════════════════════════════ */
function TypingText({ texts, className = '' }) {
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    const speed = isDeleting ? 30 : 60;

    if (!isDeleting && displayed === current) {
      const timeout = setTimeout(() => setIsDeleting(true), 2000);
      return () => clearTimeout(timeout);
    }
    if (isDeleting && displayed === '') {
      setIsDeleting(false);
      setIndex((prev) => (prev + 1) % texts.length);
      return;
    }

    const timeout = setTimeout(() => {
      setDisplayed(isDeleting ? current.slice(0, displayed.length - 1) : current.slice(0, displayed.length + 1));
    }, speed);
    return () => clearTimeout(timeout);
  }, [displayed, isDeleting, index, texts]);

  return (
    <span className={className}>
      {displayed}
      <span className="inline-block w-[3px] h-[1em] bg-primary ml-0.5 animate-pulse align-middle" />
    </span>
  );
}

/* ═══════════════════════════════════════════
   LIVE DASHBOARD MOCKUP — hero visual
   ═══════════════════════════════════════════ */
function DashboardMockup() {
  const barData = [35, 52, 45, 72, 58, 85, 90];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 8 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative mx-auto max-w-4xl mt-16 md:mt-20"
      style={{ perspective: '1200px' }}
    >
      {/* Glow behind */}
      <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20 rounded-[2rem] blur-2xl opacity-60" />

      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0a0a1a]/80 backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1 rounded-md bg-white/[0.05] text-[11px] text-white/30 font-mono">
              app.prepster.in/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-5 md:p-6">
          <div className="grid grid-cols-12 gap-4">
            {/* Stats row */}
            <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Questions Solved', value: '1,247', change: '+86 today', color: 'text-violet-400', bg: 'bg-violet-500/10' },
                { label: 'Accuracy Rate', value: '78.5%', change: '+3.2%', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Current Streak', value: '14 days', change: 'Personal best!', color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Readiness Score', value: '72/100', change: 'TCS Ready', color: 'text-blue-400', bg: 'bg-blue-500/10' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                  className={`${s.bg} rounded-xl p-3.5 border border-white/[0.04]`}
                >
                  <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1">{s.label}</p>
                  <p className={`text-lg md:text-xl font-bold font-display ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">{s.change}</p>
                </motion.div>
              ))}
            </div>

            {/* Chart */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.6 }}
              className="col-span-12 md:col-span-8 bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]"
            >
              <p className="text-xs text-white/40 mb-4 font-medium">Weekly Performance</p>
              <div className="flex items-end justify-between gap-2 h-28">
                {barData.map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: 1.8 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                      className="w-full rounded-md bg-gradient-to-t from-violet-600/60 to-violet-400/40 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                    </motion.div>
                    <span className="text-[9px] text-white/25">{days[i]}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Weak areas */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="col-span-12 md:col-span-4 bg-white/[0.02] rounded-xl p-4 border border-white/[0.04]"
            >
              <p className="text-xs text-white/40 mb-3 font-medium">Focus Areas</p>
              {[
                { topic: 'Data Interpretation', pct: 45, color: 'bg-red-500' },
                { topic: 'Syllogisms', pct: 58, color: 'bg-amber-500' },
                { topic: 'Permutations', pct: 62, color: 'bg-yellow-500' },
              ].map((area, i) => (
                <div key={area.topic} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="text-white/50">{area.topic}</span>
                    <span className="text-white/30">{area.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${area.pct}%` }}
                      transition={{ delay: 2.0 + i * 0.1, duration: 0.8 }}
                      className={`h-full rounded-full ${area.color}/60`}
                    />
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Reflection */}
      <div className="absolute -bottom-12 inset-x-8 h-12 bg-gradient-to-b from-primary/5 to-transparent blur-xl rounded-full" />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════ */
const FEATURES = [
  {
    icon: Brain,
    title: 'Adaptive Aptitude Engine',
    description: 'Questions that evolve with you. Our engine adjusts difficulty in real-time based on your performance across Quant, Logical, Verbal & DI.',
    gradient: 'from-violet-500 to-purple-600',
    stat: '25,000+ questions',
    statIcon: Sparkles,
  },
  {
    icon: Building2,
    title: 'Company Prep Tracks',
    description: 'Dedicated preparation tracks for 100+ companies. Round-by-round breakdowns, previous year papers, cutoff data, and company-specific mock tests.',
    gradient: 'from-blue-500 to-cyan-500',
    stat: '100+ companies',
    statIcon: Target,
  },
  {
    icon: Briefcase,
    title: 'Curated Job Feed',
    description: 'Fresher-focused roles from verified employers. Filter by batch year, location, CTC & apply directly — no more hunting across 10 portals.',
    gradient: 'from-emerald-500 to-teal-500',
    stat: 'Direct apply',
    statIcon: MousePointerClick,
  },
  {
    icon: BarChart3,
    title: 'Deep Analytics',
    description: 'Visual dashboards tracking accuracy by topic, speed per question, weak area detection, and your improvement trajectory over time.',
    gradient: 'from-amber-500 to-orange-500',
    stat: 'AI-powered insights',
    statIcon: TrendingUp,
  },
  {
    icon: Flame,
    title: 'Daily Challenges',
    description: 'Fresh questions every day with streaks, leaderboards, and rewards. Build consistency that compounds into placement success.',
    gradient: 'from-rose-500 to-pink-600',
    stat: 'Streak rewards',
    statIcon: Trophy,
  },
  {
    icon: Award,
    title: 'Mock Tests',
    description: 'Timed mock tests that replicate the exact pattern of each company\'s aptitude round. 30, 60, 90-minute formats available.',
    gradient: 'from-indigo-500 to-violet-600',
    stat: 'Real exam patterns',
    statIcon: Clock,
  },
];

const STATS = [
  { value: 25000, suffix: '+', label: 'Practice Questions', icon: BookOpen, gradient: 'from-violet-500 to-purple-600' },
  { value: 100, suffix: '+', label: 'Company Tracks', icon: Building2, gradient: 'from-blue-500 to-cyan-500' },
  { value: 50000, suffix: '+', label: 'Students Joined', icon: Users, gradient: 'from-emerald-500 to-teal-500' },
  { value: 98, suffix: '%', label: 'Satisfaction Rate', icon: Star, gradient: 'from-amber-500 to-orange-500' },
];

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    college: 'VIT Vellore',
    role: 'Placed at TCS Digital',
    text: 'The company mock test was almost identical to the real exam. I practiced for 2 weeks and cracked TCS NQT on my first attempt. The analytics showed me exactly where to focus.',
    rating: 5,
    avatar: 'PS',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    name: 'Rahul Kumar',
    college: 'JECRC Jaipur',
    role: 'Placed at Infosys',
    text: 'The analytics dashboard revealed my weakness in DI — something I didn\'t even realize. Fixed it in a week with targeted practice and cleared the Infosys aptitude round.',
    rating: 5,
    avatar: 'RK',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Ananya Mishra',
    college: 'Chandigarh University',
    role: 'Placed at Wipro',
    text: 'Best investment I\'ve made. The job feed alone is worth it — found a listing here, applied directly, and got the interview call within a week. Now I\'m placed at Wipro!',
    rating: 5,
    avatar: 'AM',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Deepak Singh',
    college: 'LPU Jalandhar',
    role: 'Placed at Accenture',
    text: 'I was from a Tier 3 college with zero prep resources. Prepster gave me the same preparation quality as someone from an IIT. The company tracks are incredibly detailed.',
    rating: 5,
    avatar: 'DS',
    gradient: 'from-rose-500 to-pink-600',
  },
];

const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Accenture', 'Cognizant', 'HCL', 'Capgemini', 'Tech Mahindra', 'Amazon', 'Zoho', 'Deloitte', 'IBM', 'Google', 'Microsoft', 'Flipkart'];

const PRICING = [
  {
    name: 'Monthly',
    price: '99',
    period: '/month',
    description: 'Perfect for trying out Pro features',
    features: ['Unlimited practice questions', 'All company tracks', 'Basic analytics', 'Direct job apply', 'Mock tests'],
    popular: false,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    name: '6 Months',
    price: '449',
    period: '/6 months',
    description: 'Most popular for placement season',
    features: ['Everything in Monthly', 'Advanced analytics & AI insights', 'Priority job applications', 'Streak rewards & badges', 'Email alerts for new jobs', 'Performance reports'],
    popular: true,
    gradient: 'from-violet-500 to-purple-600',
    save: 'Save ₹145',
  },
  {
    name: '1 Year',
    price: '799',
    period: '/year',
    description: 'Best value for serious preparation',
    features: ['Everything in 6 Months', 'Resume review (1x)', 'Early access to new features', 'Community Discord access', 'Placement guarantee program', '1-on-1 doubt clearing session'],
    popular: false,
    gradient: 'from-emerald-500 to-teal-500',
    save: 'Save ₹389',
  },
];

const PROCESS_STEPS = [
  { num: '01', title: 'Sign Up Free', description: 'Create your account in 30 seconds. No credit card needed.', icon: Rocket },
  { num: '02', title: 'Pick Your Companies', description: 'Choose the companies you\'re targeting. Get a custom prep roadmap.', icon: Target },
  { num: '03', title: 'Practice Daily', description: 'Solve adaptive questions, take mock tests, build streaks.', icon: Brain },
  { num: '04', title: 'Get Placed', description: 'Apply to curated jobs. Ace the interview. Land the offer.', icon: Trophy },
];

/* ═══════════════════════════════════════════
   SECTION REVEAL WRAPPER
   ═══════════════════════════════════════════ */
const SectionReveal = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-80px' }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ═══════════════════════════════════════════
   SECTION LABEL
   ═══════════════════════════════════════════ */
const SectionLabel = ({ text }) => (
  <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-primary mb-5">
    <span className="w-8 h-px bg-primary/50" />
    {text}
    <span className="w-8 h-px bg-primary/50" />
  </span>
);


/* ═══════════════════════════════════════════
   MAIN LANDING COMPONENT
   ═══════════════════════════════════════════ */
export default function Landing() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SEO
        title="Get Placed. Not Just Prepared."
        keywords="placement preparation, aptitude mock tests, company specific prep, fresher jobs, tech interview prep, Prepster"
        schema={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Prepster",
          "url": "https://prepster.in",
          "description": "Prepare for your campus placements with company-specific tracks, aptitude mock tests, and curated job feeds."
        }}
      />

      <MouseGlow />

      {/* ═══════════════ NAV ═══════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'border-b border-border/50 bg-background/70 backdrop-blur-2xl shadow-lg shadow-black/5' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/logo.png" alt="Prepster" className="w-9 h-9 object-contain dark:brightness-[10] dark:saturate-0 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-tight font-display">Prepster</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
            {[
              { to: '/aptitude', label: 'Practice' },
              { to: '/companies', label: 'Companies' },
              { to: '/jobs', label: 'Jobs' },
              { to: '/roadmap', label: 'Roadmaps' },
              { to: '/blogs', label: 'Blog' },
            ].map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="text-muted-foreground hover:text-foreground transition-colors relative group py-1"
              >
                {link.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-gradient-to-r from-primary to-purple-500 rounded-full group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to="/auth/login" className="hidden sm:block">
              <Button variant="ghost" className="font-medium text-sm">Sign In</Button>
            </Link>
            <Link to="/auth/register" className="hidden sm:block">
              <Button size="sm" className="sm:text-sm sm:h-9 sm:px-5 font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity border-0 shadow-lg shadow-primary/20 rounded-lg">
                Start Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
            <button
              className="lg:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed inset-x-0 top-16 z-40 bg-background/95 backdrop-blur-2xl border-b border-border shadow-2xl lg:hidden overflow-hidden"
          >
            <div className="px-5 py-6 flex flex-col gap-1">
              {['Practice', 'Companies', 'Jobs', 'Roadmaps', 'Blog'].map((item) => (
                <Link
                  key={item}
                  to={`/${item === 'Practice' ? 'aptitude' : item === 'Blog' ? 'blogs' : item.toLowerCase()}`}
                  className="text-lg font-medium py-3 px-3 rounded-xl hover:bg-secondary/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-border/50 sm:hidden">
                <Link to="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full h-12 text-base">Sign In</Button>
                </Link>
                <Link to="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full h-12 text-base bg-gradient-to-r from-primary to-purple-600">Get Started Free</Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative pt-24 md:pt-32 pb-0 px-4 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }} />
          {/* Aurora orbs */}
          <AuroraOrb className="w-[600px] h-[600px] -top-[200px] left-[-100px]" />
          <AuroraOrb className="w-[500px] h-[500px] -top-[100px] right-[-150px]" />
          <AuroraOrb className="w-[400px] h-[400px] top-[40%] left-[30%]" />
          {/* Gradient line accents */}
          <div className="absolute top-32 left-[10%] w-px h-40 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
          <div className="absolute top-48 right-[15%] w-px h-32 bg-gradient-to-b from-transparent via-purple-500/15 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 30, filter: 'blur(20px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-8"
          >
            <span className="inline-flex items-center gap-2.5 bg-gradient-to-r from-primary/[0.08] via-purple-500/[0.06] to-blue-500/[0.08] text-foreground border border-primary/15 px-5 py-2.5 rounded-full text-sm font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              India's #1 Placement Preparation Platform
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </span>
          </motion.div>

          {/* Main headline */}
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 40, filter: 'blur(20px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="font-display text-[clamp(2.2rem,8vw,6rem)] font-bold tracking-tight leading-[1.05] mb-4"
            >
              <span className="block">Get Placed.</span>
              <span className="block bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent animate-gradient-x" style={{ backgroundSize: '200% auto' }}>
                Not Just Prepared.
              </span>
            </motion.h1>

            {/* Typing subline */}
            <motion.div
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.35 }}
              className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-4"
            >
              <span className="text-foreground/90 font-medium">25,000+ questions</span> ·{' '}
              <span className="text-foreground/90 font-medium">100+ company tracks</span> ·{' '}
              <span className="text-foreground/90 font-medium">Curated jobs</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45 }}
              className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10"
            >
              The complete placement toolkit for{' '}
              <TypingText
                texts={['Engineering students', 'MBA students', 'Tier 2/3 college students', 'Campus placement prep']}
                className="text-primary font-semibold"
              />
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.55 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/auth/register">
                <Button size="lg" className="text-base px-8 h-14 font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 hover:opacity-90 border-0 shadow-[0_8px_40px_rgba(139,92,246,0.35)] hover:shadow-[0_8px_60px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all duration-300 rounded-xl group">
                  Start Practicing — It's Free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/upgrade" className="group">
                <Button size="lg" variant="outline" className="text-base px-8 h-14 rounded-xl border-border/50 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300">
                  <Play className="w-4 h-4 mr-2 text-primary group-hover:scale-110 transition-transform" />
                  View Pro Plans
                </Button>
              </Link>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-muted-foreground"
            >
              <div className="flex -space-x-2.5">
                {[
                  { initials: 'PS', colors: 'from-violet-500 to-purple-600' },
                  { initials: 'RK', colors: 'from-blue-500 to-cyan-500' },
                  { initials: 'AM', colors: 'from-emerald-500 to-teal-500' },
                  { initials: 'DS', colors: 'from-rose-500 to-pink-600' },
                  { initials: 'NK', colors: 'from-amber-500 to-orange-500' },
                ].map((a, i) => (
                  <div
                    key={a.initials}
                    className={`w-9 h-9 rounded-full bg-gradient-to-br ${a.colors} flex items-center justify-center text-[10px] font-bold text-white ring-[3px] ring-background`}
                    style={{ zIndex: 5 - i }}
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <span>Trusted by <span className="text-foreground font-bold">50,000+</span> students across India</span>
              </div>
            </motion.div>
          </div>

          {/* Dashboard mockup */}
          <DashboardMockup />
        </div>

        {/* Gradient divider to next section */}
        <div className="h-32 bg-gradient-to-b from-transparent to-background relative z-10 mt-8" />
      </section>


      {/* ═══════════════ COMPANY MARQUEE ═══════════════ */}
      <section className="py-12 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-background to-transparent z-10" />
        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-background to-transparent z-10" />

        <SectionReveal className="text-center mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground/60">
            Prepare for companies that hire every year
          </p>
        </SectionReveal>

        <div className="animate-marquee whitespace-nowrap flex items-center gap-16">
          {[...COMPANIES, ...COMPANIES].map((company, i) => (
            <span
              key={`${company}-${i}`}
              className="text-xl md:text-2xl font-display font-bold text-muted-foreground/20 hover:text-primary/60 transition-colors duration-500 cursor-default select-none"
            >
              {company}
            </span>
          ))}
        </div>
      </section>


      {/* ═══════════════ STATS ═══════════════ */}
      <section className="py-20 md:py-28 px-4 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {STATS.map((stat, i) => (
              <SectionReveal key={stat.label} delay={i * 0.08}>
                <div className="group relative rounded-2xl border border-border/30 bg-card/20 backdrop-blur-sm p-4 sm:p-6 md:p-8 text-center hover:border-primary/20 transition-all duration-500 overflow-hidden">
                  {/* Background glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500`} />

                  <div className="relative">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-display text-foreground mb-1.5">
                      <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-20 md:py-28 px-4 relative">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <SectionReveal className="text-center mb-16">
            <SectionLabel text="Features" />
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Everything you need to<br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">crack any placement</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From Day 1 of preparation to your first offer letter — all in one platform.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feature, i) => (
              <SectionReveal key={feature.title} delay={i * 0.08}>
                <TiltCard>
                  <div className="group relative rounded-3xl border border-border/30 bg-card/20 backdrop-blur-sm p-5 sm:p-7 overflow-hidden h-full hover:border-border/60 transition-all duration-500">
                    {/* Corner glow */}
                    <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${feature.gradient} rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700`} />

                    <div className="relative z-10">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all duration-300`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>

                      <h3 className="font-display text-xl font-bold mb-2.5">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-5">{feature.description}</p>

                      {/* Stat badge */}
                      <div className="flex items-center gap-2 text-xs font-semibold text-primary/80">
                        <feature.statIcon className="w-3.5 h-3.5" />
                        {feature.stat}
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-20 md:py-28 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-primary/[0.02] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <SectionReveal className="text-center mb-16">
            <SectionLabel text="How It Works" />
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              From zero to <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">placed</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Four simple steps. One life-changing result.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-[72px] left-[15%] right-[15%] h-px bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20" />

            {PROCESS_STEPS.map((step, i) => (
              <SectionReveal key={step.num} delay={i * 0.12}>
                <div className="relative group">
                  <div className="relative bg-card/30 backdrop-blur-sm border border-border/30 rounded-3xl p-8 text-center hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                    {/* Step badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                      <span className="text-[10px] font-bold bg-gradient-to-r from-primary to-purple-500 text-white px-4 py-1.5 rounded-full shadow-lg shadow-primary/20 tracking-wider">
                        STEP {step.num}
                      </span>
                    </div>

                    <div className="mt-4 mb-5 w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-purple-500/10 border border-primary/10 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:border-primary/20 transition-all duration-300">
                      <step.icon className="w-7 h-7 text-primary" />
                    </div>

                    <h3 className="font-display text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════ PRICING ═══════════════ */}
      <section className="py-20 md:py-28 px-4 relative" id="pricing">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-5xl mx-auto relative">
          <SectionReveal className="text-center mb-16">
            <SectionLabel text="Pricing" />
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Invest in your{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">future</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Less than a pizza per month. More than enough to land your dream placement.
            </p>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {PRICING.map((plan, i) => (
              <SectionReveal key={plan.name} delay={i * 0.1}>
                <div className={`relative h-full group ${plan.popular ? 'md:-mt-4 md:mb-0' : ''}`}>
                  {/* Glow for popular */}
                  {plan.popular && (
                    <div className="absolute -inset-px bg-gradient-to-b from-primary via-purple-500 to-blue-500 rounded-[1.6rem] blur-[1px]" />
                  )}

                  <div className={`relative h-full rounded-3xl border ${plan.popular ? 'border-primary/50 bg-card/80' : 'border-border/30 bg-card/20'} backdrop-blur-sm p-7 flex flex-col overflow-hidden transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5`}>
                    {/* Popular badge */}
                    {plan.popular && (
                      <div className="absolute top-0 right-6 bg-gradient-to-r from-primary to-purple-600 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-b-lg shadow-lg">
                        Most Popular
                      </div>
                    )}

                    {/* Plan name */}
                    <div className="mb-6">
                      <h3 className="font-display text-lg font-bold mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl md:text-5xl font-bold font-display">₹{plan.price}</span>
                        <span className="text-muted-foreground text-sm">{plan.period}</span>
                      </div>
                      {plan.save && (
                        <span className="inline-block mt-2 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                          {plan.save}
                        </span>
                      )}
                    </div>

                    {/* Features */}
                    <div className="flex-1 mb-6 space-y-3">
                      {plan.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5 text-sm">
                          <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link to="/auth/register" className="mt-auto">
                      <Button className={`w-full h-12 text-sm font-semibold rounded-xl transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shadow-lg shadow-primary/20 border-0' : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'}`}>
                        {plan.popular ? 'Get Started Now' : 'Choose Plan'}
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal className="text-center mt-8">
            <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
              <Shield className="w-4 h-4" />
              Free tier available · No credit card required · Cancel anytime
            </p>
          </SectionReveal>
        </div>
      </section>


      {/* ═══════════════ COMPARISON ═══════════════ */}
      <section className="py-20 md:py-28 px-4 relative">
        <div className="max-w-4xl mx-auto">
          <SectionReveal className="text-center mb-16">
            <SectionLabel text="Comparison" />
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">
              Why students switch to{' '}
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Prepster</span>
            </h2>
          </SectionReveal>

          <SectionReveal>
            <div className="overflow-x-auto rounded-3xl border border-border/30 bg-card/20 backdrop-blur-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="px-6 py-5 text-left font-medium text-muted-foreground text-xs uppercase tracking-wider">Feature</th>
                    <th className="px-6 py-5 text-center">
                      <span className="inline-flex items-center gap-1.5 font-bold text-primary font-display text-base">
                        <Zap className="w-4 h-4" />
                        Prepster
                      </span>
                    </th>
                    <th className="px-6 py-5 text-center text-muted-foreground/60 font-medium">Prep Sites</th>
                    <th className="px-6 py-5 text-center text-muted-foreground/60 font-medium">Job Portals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {[
                    ['Company-specific tracks', true, 'Partial', false],
                    ['Adaptive quiz engine', true, false, false],
                    ['25,000+ question bank', true, false, false],
                    ['Live job/internship feed', true, false, true],
                    ['Direct apply portal', true, false, true],
                    ['Performance analytics', true, false, false],
                    ['Ad-free experience', true, false, false],
                    ['Starting at ₹99/month', true, false, false],
                  ].map(([label, pp, pi, nk]) => (
                    <tr key={label} className="hover:bg-primary/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-sm">{label}</td>
                      <td className="px-6 py-4 text-center">
                        {pp === true ? (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          </span>
                        ) : <span className="text-muted-foreground text-xs">{pp}</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {pi === true ? <CheckCircle2 className="w-4 h-4 text-muted-foreground/30 mx-auto" /> : pi === false ? <span className="text-muted-foreground/25">—</span> : <span className="text-xs text-muted-foreground/50">{pi}</span>}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {nk === true ? <CheckCircle2 className="w-4 h-4 text-muted-foreground/30 mx-auto" /> : nk === false ? <span className="text-muted-foreground/25">—</span> : nk}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionReveal>
        </div>
      </section>


      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-20 md:py-28 px-4 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/[0.03] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative">
          <SectionReveal className="text-center mb-16">
            <SectionLabel text="Success Stories" />
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Real students.{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Real placements.</span>
            </h2>
          </SectionReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <SectionReveal key={t.name} delay={i * 0.08}>
                <div className="group relative h-full">
                  <div className="relative h-full rounded-3xl border border-border/30 bg-card/20 backdrop-blur-sm p-7 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col">
                    {/* Quote */}
                    <div className="absolute top-5 right-6 text-7xl font-serif text-primary/[0.06] leading-none select-none">"</div>

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-4">
                      {Array.from({ length: t.rating }).map((_, j) => (
                        <Star key={j} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>

                    <p className="text-muted-foreground leading-relaxed mb-6 flex-1 text-sm md:text-base relative z-10">
                      "{t.text}"
                    </p>

                    <div className="flex items-center gap-3 pt-4 border-t border-border/20">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-bold text-white shadow-lg`}>
                        {t.avatar}
                      </div>
                      <div>
                        <p className="font-bold text-sm">{t.name}</p>
                        <p className="text-xs text-primary font-semibold">{t.role}</p>
                        <p className="text-xs text-muted-foreground">{t.college}</p>
                      </div>
                      <BadgeCheck className="w-5 h-5 text-primary ml-auto shrink-0" />
                    </div>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>


      {/* ═══════════════ FINAL CTA ═══════════════ */}
      <section className="py-20 md:py-28 px-4 relative">
        <div className="max-w-5xl mx-auto">
          <SectionReveal>
            <div className="relative overflow-hidden rounded-[2rem] border border-border/30">
              {/* Background layers */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-blue-500/20" />
              <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-primary/15 rounded-full blur-[120px]" />
              <div className="absolute bottom-0 right-[20%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
              {/* Dot pattern */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }} />

              <div className="relative px-8 py-16 md:py-24 md:px-16 text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, type: 'spring' }}
                  className="relative mx-auto mb-8 w-20 h-20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 rounded-2xl blur-xl opacity-40" />
                  <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-2xl">
                    <GraduationCap className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                  Your placement journey<br />
                  <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">starts here</span>
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                  Join 50,000+ students who are preparing smarter, not harder.
                  <span className="text-foreground font-medium"> Start free today.</span>
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link to="/auth/register">
                    <Button size="lg" className="text-base px-10 h-14 font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 hover:opacity-90 border-0 shadow-[0_8px_40px_rgba(139,92,246,0.35)] hover:shadow-[0_8px_60px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all duration-300 rounded-xl group">
                      Create Free Account
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> No credit card</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Setup in 30 sec</span>
                  <span className="flex items-center gap-1.5"><Zap className="w-4 h-4" /> Free tier forever</span>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>


      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="border-t border-border/30 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src="/logo.png" alt="Prepster" className="w-8 h-8 object-contain dark:brightness-[10] dark:saturate-0" />
                <span className="font-display font-bold text-lg">Prepster</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                India's most loved placement preparation platform for engineering & MBA students.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="font-display font-semibold text-sm mb-4">Platform</p>
              <div className="flex flex-col gap-2.5">
                {[['Practice', '/aptitude'], ['Companies', '/companies'], ['Jobs', '/jobs'], ['Mock Tests', '/aptitude']].map(([label, to]) => (
                  <Link key={label} to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                ))}
              </div>
            </div>

            <div>
              <p className="font-display font-semibold text-sm mb-4">Resources</p>
              <div className="flex flex-col gap-2.5">
                {[['Blog', '/blogs'], ['Roadmaps', '/roadmap'], ['Pricing', '/upgrade'], ['FAQ', '/faq']].map(([label, to]) => (
                  <Link key={label} to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                ))}
              </div>
            </div>

            <div>
              <p className="font-display font-semibold text-sm mb-4">Company</p>
              <div className="flex flex-col gap-2.5">
                {[['About Us', '/about'], ['Contact Us', '/contact'], ['Privacy Policy', '/privacy'], ['Terms of Service', '/terms']].map(([label, to]) => (
                  <Link key={label} to={to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-border/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © 2025 Prepster by Dinz Software Pvt. Ltd. · All rights reserved.
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              Made with <span className="text-red-500 mx-0.5">♥</span> for Indian students
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

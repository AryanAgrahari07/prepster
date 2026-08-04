import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  HelpCircle, ChevronDown, ArrowRight, Search,
  BookOpen, CreditCard, Building2, Shield, Zap, User
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import SEO from '@/components/seo/SEO';
import { schemas } from '@/components/seo/SchemaTemplates';

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

const CATEGORIES = [
  { id: 'general', label: 'General', icon: HelpCircle },
  { id: 'account', label: 'Account', icon: User },
  { id: 'practice', label: 'Practice', icon: BookOpen },
  { id: 'companies', label: 'Companies', icon: Building2 },
  { id: 'pricing', label: 'Pricing', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
];

const FAQ_DATA = [
  {
    category: 'general',
    question: 'What is Prepster?',
    answer: 'Prepster is India\'s #1 comprehensive placement preparation platform built specifically for engineering and MBA students. Our platform integrates an adaptive aptitude test engine (with 25,000+ quantitative aptitude, logical reasoning, and verbal questions), in-depth company-specific preparation tracks (for TCS NQT, Infosys, Wipro, Accenture, and 100+ others), and a curated entry-level fresher job feed. Whether you are preparing for campus placements, technical interview rounds, or off-campus drives, Prepster is the ultimate toolkit.',
  },
  {
    category: 'general',
    question: 'Who is Prepster for?',
    answer: 'Prepster is designed for Indian engineering (B.Tech/B.E/BCA) and MBA students (2nd–4th year) actively preparing for campus placements and off-campus fresher jobs. Whether you\'re from a Tier 1, 2, or 3 college, Prepster equips you with the exact previous year placement papers, GD/PI mock interviews, and coding logic preparation you need to land top software engineering or management roles.',
  },
  {
    category: 'general',
    question: 'Is Prepster free to use?',
    answer: 'Yes! Prepster has a generous free tier that gives you 20 questions per day, access to 1 company track overview, and the ability to browse the job feed. For unlimited access, you can upgrade to Pro starting at just ₹99/month.',
  },
  {
    category: 'general',
    question: 'How is Prepster different from other prep platforms?',
    answer: 'Unlike other platforms, Prepster combines three things in one: (1) An adaptive aptitude engine that adjusts difficulty based on your performance, (2) Dedicated company-specific tracks with round-by-round breakdowns, previous papers, and mock tests, and (3) A curated job feed with direct apply functionality. No other platform offers all three.',
  },
  {
    category: 'account',
    question: 'How do I create an account?',
    answer: 'You can sign up using your email address and password, or use Google Sign-In for one-click registration. Go to prepster.in and click "Get Started Free" to begin. No credit card required.',
  },
  {
    category: 'account',
    question: 'Can I change my email or profile details?',
    answer: 'Yes, you can update your profile information (name, college, branch, graduation year, CGPA, target companies, phone) from the Profile section in your dashboard. Email changes require re-verification.',
  },
  {
    category: 'account',
    question: 'How do I delete my account?',
    answer: 'You can request account deletion from Settings > Account > Delete Account. There\'s a 30-day grace period during which you can reactivate your account. After 30 days, all your data is permanently deleted.',
  },
  {
    category: 'practice',
    question: 'How many questions are available?',
    answer: 'Prepster currently has 25,000+ questions across four categories: Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Data Interpretation. Each question is tagged by topic, subtopic, difficulty level, and company relevance.',
  },
  {
    category: 'practice',
    question: 'What is the adaptive quiz engine?',
    answer: 'Our adaptive engine adjusts the difficulty of questions in real-time based on your last 3 answers. If you\'re getting questions right, the difficulty increases. If you\'re struggling, it eases up. This ensures you\'re always practicing at your optimal learning level.',
  },
  {
    category: 'practice',
    question: 'What are Daily Challenges?',
    answer: 'Every day, Prepster generates a fresh set of 20 questions tailored to your weak areas. Completing daily challenges builds streaks, earns rewards, and helps maintain consistency — the #1 factor in placement success.',
  },
  {
    category: 'practice',
    question: 'How do mock tests work?',
    answer: 'Mock tests replicate the exact pattern of each company\'s aptitude round — same number of questions, same time limit, same topic distribution. Available in 30, 60, and 90-minute formats. After completion, you get detailed analytics including question-wise time analysis and comparison with other students.',
  },
  {
    category: 'practice',
    question: 'What analytics do I get?',
    answer: 'Prepster provides detailed analytics including: accuracy by topic and subtopic, speed per question, improvement graphs over time, weak area detection (bottom 3 topics), strong area recognition, daily activity heatmap, and company readiness scores. Pro users get AI-powered insights and personalized recommendations.',
  },
  {
    category: 'companies',
    question: 'Which companies have tracks on Prepster?',
    answer: 'Prepster has tracks for 100+ companies including TCS, Infosys, Wipro, Accenture, Cognizant, HCL, Capgemini, Tech Mahindra, Amazon, Zoho, Deloitte, IBM, and many more. Each track includes hiring process overview, round-wise breakdown, previous year papers, cutoff data, package info, and company-specific mock tests.',
  },
  {
    category: 'companies',
    question: 'How accurate are the company track details?',
    answer: 'Our company tracks are compiled from official hiring processes, verified student experiences, and publicly available data. We update tracks regularly, especially before placement season. However, companies may change their processes, so we recommend checking the latest updates on the company\'s official career page as well.',
  },
  {
    category: 'companies',
    question: 'Can I request a new company track?',
    answer: 'Yes! If the company you\'re preparing for isn\'t on Prepster yet, you can request it through the "Request a Track" option on the Companies page. We prioritize new tracks based on student demand.',
  },
  {
    category: 'pricing',
    question: 'What are the Pro plan prices?',
    answer: 'Prepster Pro is available in three plans: Monthly at ₹99/month, 6 Months at ₹449 (save ₹145), and Annual at ₹799/year (save ₹389). All plans include unlimited questions, all company tracks, mock tests, analytics, direct job apply, and an ad-free experience.',
  },
  {
    category: 'pricing',
    question: 'What payment methods are accepted?',
    answer: 'We accept all major payment methods through Razorpay: UPI (GPay, PhonePe, Paytm), credit/debit cards (Visa, Mastercard, RuPay), net banking, and select EMI options.',
  },
  {
    category: 'pricing',
    question: 'Can I get a refund?',
    answer: 'Yes, we offer a 7-day money-back guarantee from your initial purchase date. If you\'re not satisfied with Prepster Pro within 7 days, contact support@prepster.in for a full refund. Refunds are not available after 7 days or for renewal charges.',
  },
  {
    category: 'pricing',
    question: 'Do you offer college bulk discounts?',
    answer: 'Yes! We offer special pricing for college partnerships and bulk licenses. If you\'re a placement coordinator or faculty member, contact us at partnerships@prepster.in for custom pricing.',
  },
  {
    category: 'pricing',
    question: 'How do coupon codes work?',
    answer: 'Coupon codes can be applied during checkout for discounts on Pro subscriptions. Coupons are available through our ambassador program, college partnerships, and promotional campaigns. Enter your code on the Upgrade page to see the discount applied.',
  },
  {
    category: 'security',
    question: 'Is my data safe on Prepster?',
    answer: 'Absolutely. We use industry-standard security measures including bcrypt password hashing (12 salt rounds), TLS 1.3 encryption for all data in transit, JWT-based authentication with 15-minute access tokens and refresh token rotation, rate limiting, and regular security audits. Your payment data is handled by Razorpay and never stored on our servers.',
  },
  {
    category: 'security',
    question: 'Who can see my quiz scores?',
    answer: 'Only you can see your detailed quiz scores and analytics. We never share your performance data with employers, colleges, or other students. The only data shared with employers is your profile information when you explicitly apply to a job.',
  },
  {
    category: 'security',
    question: 'Does Prepster share my data with third parties?',
    answer: 'We only share data with essential service providers (hosting, payments, email) required to operate the platform, and with employers only when you apply to their job listings. We never sell your data. Read our full Privacy Policy for details.',
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-border/20 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
      >
        <span className="font-medium text-foreground group-hover:text-primary transition-colors text-[15px]">
          {faq.question}
        </span>
        <ChevronDown className={`w-5 h-5 text-muted-foreground shrink-0 mt-0.5 transition-transform duration-200 ${open ? 'rotate-180 text-primary' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed pb-5 pr-8">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [activeCategory, setActiveCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = FAQ_DATA.filter((faq) => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      <SEO
        title="Frequently Asked Questions"
        description="Find answers to common questions about Prepster — pricing, features, account, and more."
        keywords="prepster faq, placement preparation questions, prepster help, prepster pricing faq"
        schema={[
          schemas.faqPage(FAQ_DATA)
        ]}
      />

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[20%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.08)_0%,transparent_70%)] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <SectionReveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-primary mb-6">
              <span className="w-8 h-px bg-primary/50" />
              FAQ
              <span className="w-8 h-px bg-primary/50" />
            </span>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Frequently Asked{' '}
              <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                Questions
              </span>
            </h1>
          </SectionReveal>

          <SectionReveal delay={0.2}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Everything you need to know about Prepster. Can't find an answer? Contact our support team.
            </p>
          </SectionReveal>

          {/* Search */}
          <SectionReveal delay={0.3}>
            <div className="max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for answers..."
                className="w-full h-12 rounded-xl bg-card/30 border border-border/30 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all backdrop-blur-sm"
              />
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Category Pills */}
      <section className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <SectionReveal>
            <div className="flex flex-wrap justify-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat.id
                      ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                      : 'bg-card/20 border border-border/30 text-muted-foreground hover:border-primary/20 hover:text-foreground'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.label}
                </button>
              ))}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* FAQ List */}
      <section className="py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="bg-card/20 backdrop-blur-sm border border-border/30 rounded-3xl p-6 md:p-8">
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <HelpCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No matching questions found.</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">Try a different search term or category.</p>
                </div>
              ) : (
                filteredFAQs.map((faq, i) => (
                  <FAQItem key={i} faq={faq} />
                ))
              )}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* Still have questions CTA */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-gradient-to-br from-primary/15 via-purple-500/10 to-blue-500/15 p-10 text-center">
              <div className="absolute top-0 left-1/4 w-60 h-60 bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.1)_0%,transparent_70%)] rounded-full" />
              <div className="relative">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Still have questions?</h2>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link to="/contact">
                    <Button className="bg-gradient-to-r from-primary to-purple-600 border-0 h-11 px-6 font-semibold rounded-xl shadow-lg shadow-primary/20">
                      Contact Support <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                  <a href="mailto:support@prepster.in">
                    <Button variant="outline" className="h-11 px-6 rounded-xl">
                      Email Us
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}

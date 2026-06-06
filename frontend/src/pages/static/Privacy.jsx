import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import SEO from '@/components/seo/SEO';

const SectionReveal = ({ children, className = '', delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-60px' }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

const SECTIONS = [
  {
    title: '1. Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'When you create an account, we collect your name, email address, college name, branch, graduation year, CGPA, and optionally your phone number. If you sign up using Google OAuth, we receive your name, email, and profile photo from Google.',
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect information about how you use Prepster, including questions attempted, quiz session data, time spent per question, accuracy metrics, and pages visited. This data is used to power your analytics dashboard and provide adaptive question recommendations.',
      },
      {
        subtitle: 'Payment Information',
        text: 'When you subscribe to Prepster Pro, payment processing is handled by Razorpay. We do not store your credit card numbers, bank account details, or UPI credentials on our servers. We only store the transaction ID, subscription status, and plan details.',
      },
      {
        subtitle: 'Resume Data',
        text: 'If you upload a resume for job applications, it is stored securely on Cloudinary. You may delete your resume at any time from your profile settings.',
      },
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      {
        text: 'We use the information collected to: provide and maintain the Prepster platform; personalize your learning experience through adaptive question difficulty; generate performance analytics and weak area detection; match you with relevant job opportunities; process your subscription payments; send transactional emails (password resets, application status updates); improve our question bank and platform features based on aggregate usage patterns; and comply with legal obligations.',
      },
    ],
  },
  {
    title: '3. Data Sharing & Disclosure',
    content: [
      {
        subtitle: 'Employers',
        text: 'When you apply to a job through Prepster, your profile information (name, email, college, branch, graduation year, CGPA, and uploaded resume) is shared with the employer who posted the listing. We never share your quiz scores or analytics data with employers.',
      },
      {
        subtitle: 'Service Providers',
        text: 'We use third-party services including MongoDB Atlas (database), Cloudinary (media storage), Razorpay (payments), SendGrid (email), and Vercel/Railway (hosting). Each provider processes data only as necessary to perform their services and is bound by their own privacy policies.',
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information if required by law, regulation, or legal process, or if we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.',
      },
    ],
  },
  {
    title: '4. Data Security',
    content: [
      {
        text: 'We implement industry-standard security measures including: passwords hashed with bcrypt (12 salt rounds); all data transmitted over TLS 1.3 encryption; JWT-based authentication with short-lived access tokens (15 minutes) and refresh token rotation; rate limiting on all API endpoints; and regular security audits. While we strive to protect your data, no method of transmission over the Internet is 100% secure.',
      },
    ],
  },
  {
    title: '5. Data Retention',
    content: [
      {
        text: 'Your account data is retained as long as your account is active. If you request account deletion, we perform a soft delete and permanently remove your data after a 30-day grace period. Quiz session data older than 12 months may be aggregated and anonymized for platform improvement purposes. Daily activity analytics are retained for the last 90 days per user.',
      },
    ],
  },
  {
    title: '6. Your Rights',
    content: [
      {
        text: 'You have the right to: access your personal data through your profile and analytics dashboard; update or correct your personal information at any time; download your quiz history and performance data; delete your account and associated data; opt out of promotional emails (transactional emails required for service cannot be opted out); and withdraw consent for data processing. To exercise any of these rights, contact us at privacy@prepster.in.',
      },
    ],
  },
  {
    title: '7. Cookies & Tracking',
    content: [
      {
        text: 'Prepster uses essential cookies for authentication (JWT tokens stored in HTTP-only cookies) and theme preferences (light/dark mode). We do not use third-party advertising cookies. Free-tier users may see platform ads which are served without behavioral tracking.',
      },
    ],
  },
  {
    title: '8. Children\'s Privacy',
    content: [
      {
        text: 'Prepster is designed for college-age students (18+). We do not knowingly collect information from children under 18. If we learn we have collected data from a minor, we will take steps to delete it promptly.',
      },
    ],
  },
  {
    title: '9. Changes to This Policy',
    content: [
      {
        text: 'We may update this Privacy Policy from time to time. When we do, we will update the "Last Updated" date at the top and notify registered users via email if the changes are significant. Continued use of Prepster after changes constitutes acceptance of the updated policy.',
      },
    ],
  },
  {
    title: '10. Contact Us',
    content: [
      {
        text: 'If you have questions about this Privacy Policy or our data practices, contact us at: privacy@prepster.in or write to Dinz Software Pvt. Ltd., India.',
      },
    ],
  },
];

export default function Privacy() {
  return (
    <div>
      <SEO
        title="Privacy Policy"
        description="Learn how Prepster collects, uses, and protects your personal information."
        keywords="prepster privacy policy, data protection, student data privacy"
        url="https://prepster.in/privacy"
      />

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[40%] h-[40%] bg-primary/8 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <SectionReveal>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary/20">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground">
              Last updated: June 1, 2025 · Effective for all users of prepster.in
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="bg-card/20 backdrop-blur-sm border border-border/30 rounded-3xl p-8 md:p-10 mb-8">
              <p className="text-muted-foreground leading-relaxed">
                At Prepster (operated by Dinz Software Pvt. Ltd.), we take your privacy seriously. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you use our platform at prepster.in. Please read this policy carefully. By using Prepster, 
                you consent to the data practices described in this policy.
              </p>
            </div>
          </SectionReveal>

          <div className="space-y-8">
            {SECTIONS.map((section, i) => (
              <SectionReveal key={i} delay={0.05}>
                <div className="border-b border-border/20 pb-8 last:border-0">
                  <h2 className="font-display text-xl md:text-2xl font-bold mb-4">{section.title}</h2>
                  <div className="space-y-4">
                    {section.content.map((block, j) => (
                      <div key={j}>
                        {block.subtitle && (
                          <h3 className="font-semibold text-sm text-foreground/90 mb-1.5">{block.subtitle}</h3>
                        )}
                        <p className="text-sm text-muted-foreground leading-relaxed">{block.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="flex items-center justify-between bg-card/20 border border-border/30 rounded-2xl p-6">
              <div>
                <p className="font-bold text-sm">Questions about your data?</p>
                <p className="text-sm text-muted-foreground">Reach out to our privacy team anytime.</p>
              </div>
              <Link to="/contact">
                <Button variant="outline" size="sm" className="rounded-lg">
                  Contact Us <ArrowRight className="ml-1 w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}

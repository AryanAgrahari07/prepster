import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
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
    title: '1. Acceptance of Terms',
    content: 'By accessing or using Prepster (prepster.in), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using the platform. These Terms apply to all visitors, users, students, employers, and other persons who access or use the Service.',
  },
  {
    title: '2. Account Registration',
    content: 'To access certain features, you must register for an account. You agree to: provide accurate, current, and complete information during registration; maintain and update your information to keep it accurate; maintain the security of your password and accept all risks of unauthorized access; notify us immediately of any unauthorized use of your account. You are responsible for all activities that occur under your account. We reserve the right to suspend or terminate accounts that violate these terms.',
  },
  {
    title: '3. Subscription & Payments',
    content: 'Prepster offers a free tier with limited access and paid Pro subscriptions (₹99/month, ₹449/6 months, ₹799/year). By subscribing to a Pro plan, you agree to: pay the applicable subscription fees as listed at the time of purchase; subscription fees are billed in advance on a recurring basis based on your chosen plan; all payments are processed securely through Razorpay and are subject to Razorpay\'s terms of service. Refund Policy: If you are not satisfied with your Pro subscription, you may request a refund within 7 days of your initial purchase. Refunds are not available after the 7-day period or for renewal charges. Auto-renewal can be cancelled at any time from your account settings. Cancellation takes effect at the end of the current billing period.',
  },
  {
    title: '4. Free Tier Limitations',
    content: 'Free tier users are subject to the following limitations: 20 questions per day across all topics; access to 1 company track overview (without mock tests); job feed viewing only (no direct apply); limited analytics. These limits reset daily at midnight IST. Attempting to circumvent free tier limits through multiple accounts or automated means is a violation of these terms and may result in account termination.',
  },
  {
    title: '5. Acceptable Use',
    content: 'You agree NOT to: use the platform for any unlawful purpose; share, redistribute, or commercially exploit Prepster\'s question bank, solutions, or company track content; use automated scripts, bots, or scrapers to extract content from the platform; create multiple accounts to circumvent free tier limits; share your Pro account credentials with others; upload malicious content, spam, or offensive material; impersonate another person or entity; interfere with or disrupt the platform\'s infrastructure; attempt to gain unauthorized access to other users\' accounts or our systems.',
  },
  {
    title: '6. Intellectual Property',
    content: 'All content on Prepster — including but not limited to questions, solutions, explanations, company track data, mock tests, blog articles, UI design, logos, and graphics — is the intellectual property of Dinz Software Pvt. Ltd. or its content licensors. You are granted a limited, non-exclusive, non-transferable license to access and use the content for personal, non-commercial educational purposes only. You may not copy, modify, distribute, sell, or lease any part of our content or services without explicit written permission.',
  },
  {
    title: '7. User-Generated Content',
    content: 'Certain features may allow you to submit content (e.g., profile information, resumes, feedback). You retain ownership of your content but grant Prepster a worldwide, non-exclusive, royalty-free license to use, store, and process your content as necessary to operate and improve the platform. You represent that you have the right to submit any content you provide and that your content does not violate any third party\'s rights.',
  },
  {
    title: '8. Job Listings & Applications',
    content: 'Prepster connects students with job opportunities from verified employers. We do not guarantee: the accuracy of job listing information provided by employers; that you will receive a response from employers; employment outcomes. When you apply to a job through Prepster, your profile information and resume are shared with the posting employer. Prepster is not a party to any employment relationship and is not responsible for hiring decisions made by employers.',
  },
  {
    title: '9. Disclaimer of Warranties',
    content: 'Prepster is provided "as is" and "as available" without any warranties of any kind, either express or implied. We do not warrant that: the platform will be uninterrupted, timely, secure, or error-free; the question bank will be 100% accurate or complete; your use of the platform will result in placement or employment; any performance analytics or recommendations will guarantee specific outcomes. Question content is compiled from public sources, community contributions, and original creation. While we strive for accuracy, we recommend verifying critical information independently.',
  },
  {
    title: '10. Limitation of Liability',
    content: 'To the maximum extent permitted by law, Dinz Software Pvt. Ltd. and its directors, employees, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or opportunities, arising from your use of or inability to use the platform. Our total liability for any claim arising from these terms shall not exceed the amount paid by you to Prepster in the 12 months preceding the claim.',
  },
  {
    title: '11. Account Termination',
    content: 'We may terminate or suspend your account at our sole discretion, without prior notice, if: you violate these Terms of Service; we detect fraudulent or abusive behavior; we are required to do so by law; we discontinue the service. Upon termination, your right to use the platform ceases immediately. If you have an active Pro subscription, we will provide a prorated refund for the unused portion. You may delete your account at any time from your profile settings. Account deletion is subject to a 30-day grace period during which you can reactivate.',
  },
  {
    title: '12. Modifications to Terms',
    content: 'We reserve the right to modify these Terms at any time. When we do, we will update the "Last Updated" date and notify registered users via email. Continued use of Prepster after changes constitutes acceptance of the modified terms. If you do not agree to the new terms, you must stop using the platform and may request account deletion.',
  },
  {
    title: '13. Governing Law',
    content: 'These Terms shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms or your use of Prepster shall be subject to the exclusive jurisdiction of the courts in India.',
  },
  {
    title: '14. Contact',
    content: 'For any questions regarding these Terms of Service, please contact us at: legal@prepster.in or write to Dinz Software Pvt. Ltd., India.',
  },
];

export default function Terms() {
  return (
    <div>
      <SEO
        title="Terms of Service"
        description="Read the Terms of Service for using Prepster, India's #1 placement preparation platform."
        keywords="prepster terms, terms of service, prepster legal, user agreement"
        url="https://prepster.in/terms"
      />

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08)_0%,transparent_70%)] rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative">
          <SectionReveal>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
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
                Welcome to Prepster. These Terms of Service ("Terms") govern your access to and use of the 
                Prepster platform, operated by Dinz Software Pvt. Ltd. ("Company", "we", "us", or "our"). 
                Please read these terms carefully before using our services.
              </p>
            </div>
          </SectionReveal>

          <div className="space-y-8">
            {SECTIONS.map((section, i) => (
              <SectionReveal key={i} delay={0.05}>
                <div className="border-b border-border/20 pb-8 last:border-0">
                  <h2 className="font-display text-xl md:text-2xl font-bold mb-4">{section.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
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
                <p className="font-bold text-sm">Questions about our terms?</p>
                <p className="text-sm text-muted-foreground">Our team is happy to clarify anything.</p>
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

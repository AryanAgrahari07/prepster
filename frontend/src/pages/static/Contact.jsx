import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Send, MessageSquare, Clock,
  Zap, ArrowRight, HelpCircle, Building2
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

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: 'Email Us',
    description: 'Get a response within 24 hours',
    value: 'support@prepster.in',
    link: 'mailto:support@prepster.in',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: MessageSquare,
    title: 'Live Chat',
    description: 'Available Mon–Sat, 10 AM – 7 PM IST',
    value: 'Start a conversation',
    link: null,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Phone,
    title: 'Call Us',
    description: 'Mon–Fri, 10 AM – 6 PM IST',
    value: '+91 (XXX) XXX-XXXX',
    link: null,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: MapPin,
    title: 'Office',
    description: 'Dinz Software Pvt. Ltd.',
    value: 'India',
    link: null,
    gradient: 'from-amber-500 to-orange-500',
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // In production, this would call an API endpoint
    setSubmitted(true);
  };

  return (
    <div>
      <SEO
        title="Contact Us"
        description="Get in touch with the Prepster team. We're here to help you with your placement preparation journey."
        keywords="contact prepster, prepster support, dinz software contact"
      />

      {/* Hero */}
      <section className="relative pt-24 pb-12 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <SectionReveal>
            <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.25em] text-primary mb-6">
              <span className="w-8 h-px bg-primary/50" />
              Contact
              <span className="w-8 h-px bg-primary/50" />
            </span>
          </SectionReveal>

          <SectionReveal delay={0.1}>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              We'd love to{' '}
              <span className="bg-gradient-to-r from-primary via-purple-400 to-blue-400 bg-clip-text text-transparent">
                hear from you
              </span>
            </h1>
          </SectionReveal>

          <SectionReveal delay={0.2}>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have a question, feedback, or partnership inquiry? Reach out and we'll get back to you as soon as possible.
            </p>
          </SectionReveal>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CONTACT_METHODS.map((method, i) => (
              <SectionReveal key={method.title} delay={i * 0.08}>
                <div className="group bg-card/20 backdrop-blur-sm border border-border/30 rounded-3xl p-6 hover:border-primary/20 transition-all duration-500 h-full">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${method.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <method.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold mb-1">{method.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{method.description}</p>
                  {method.link ? (
                    <a href={method.link} className="text-sm font-medium text-primary hover:underline">{method.value}</a>
                  ) : (
                    <p className="text-sm font-medium text-foreground/80">{method.value}</p>
                  )}
                </div>
              </SectionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="bg-card/20 backdrop-blur-sm border border-border/30 rounded-3xl p-8 md:p-10">
              <div className="text-center mb-8">
                <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">Send us a message</h2>
                <p className="text-sm text-muted-foreground">Fill out the form below and we'll respond within 24 hours.</p>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-5 shadow-lg">
                    <Send className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2">Message sent!</h3>
                  <p className="text-muted-foreground mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                  <Button variant="outline" onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}>
                    Send another message
                  </Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="contact-name">Name</label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                        className="w-full h-11 rounded-xl bg-background border border-border/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" htmlFor="contact-email">Email</label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
                        className="w-full h-11 rounded-xl bg-background border border-border/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="contact-subject">Subject</label>
                    <input
                      id="contact-subject"
                      type="text"
                      required
                      value={form.subject}
                      onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))}
                      className="w-full h-11 rounded-xl bg-background border border-border/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" htmlFor="contact-message">Message</label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                      className="w-full rounded-xl bg-background border border-border/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
                      placeholder="Tell us more..."
                    />
                  </div>

                  <Button type="submit" size="lg" className="w-full h-12 bg-gradient-to-r from-primary to-purple-600 border-0 font-bold rounded-xl shadow-lg shadow-primary/20">
                    Send Message <Send className="ml-2 w-4 h-4" />
                  </Button>
                </form>
              )}
            </div>
          </SectionReveal>
        </div>
      </section>

      {/* FAQ Shortcut */}
      <section className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <SectionReveal>
            <div className="flex items-center justify-between bg-card/20 border border-border/30 rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-sm">Have a common question?</p>
                  <p className="text-sm text-muted-foreground">Check our FAQ for instant answers.</p>
                </div>
              </div>
              <Link to="/faq">
                <Button variant="outline" size="sm" className="rounded-lg">
                  View FAQ <ArrowRight className="ml-1 w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </SectionReveal>
        </div>
      </section>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import ThemeToggle from '@/components/ui/ThemeToggle';

/**
 * Lightweight layout wrapper for static pages (About, Contact, Privacy, Terms, FAQ).
 * Provides a simple nav bar with back-to-home link and a branded footer.
 */
export default function StaticLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <img src="/logo.svg" alt="Prepster" className="w-9 h-9 object-contain dark:brightness-[10] dark:saturate-0 group-hover:scale-110 transition-transform" />
            <span className="text-xl font-bold tracking-tight font-display">Prepster</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/aptitude" className="text-muted-foreground hover:text-foreground transition-colors">Practice</Link>
            <Link to="/companies" className="text-muted-foreground hover:text-foreground transition-colors">Companies</Link>
            <Link to="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">Jobs</Link>
            <Link to="/blogs" className="text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link to="/auth/login" className="hidden sm:block">
              <Button variant="ghost" className="font-medium text-sm">Sign In</Button>
            </Link>
            <Link to="/auth/register" className="hidden sm:block">
              <Button size="sm" className="text-sm h-9 px-5 font-semibold bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 transition-opacity border-0 shadow-lg shadow-primary/20 rounded-lg">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <img src="/logo.svg" alt="Prepster" className="w-7 h-7 object-contain dark:brightness-[10] dark:saturate-0" />
              <span className="font-display font-bold">Prepster</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <Link to="/faq" className="hover:text-foreground transition-colors">FAQ</Link>
              <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
            </div>

            <p className="text-xs text-muted-foreground">
              © 2025 Dinz Software Pvt. Ltd.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

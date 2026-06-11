import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { getAnnouncements } from '@/api/notifications';
import { NotificationBell } from '@/components/ui/NotificationBell';
import {
  Home, User, Settings, LogOut, BookOpen, Briefcase, BarChart3,
  Building2, Zap, Shield, CalendarDays, Menu, X, Plus, Users,
  FileText, ChevronRight, Map, Trophy, Bell, Info, AlertTriangle, CheckCircle2, Lock
} from 'lucide-react';
import { Button } from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

// Navigation config — grouped by section
const NAV = [
  {
    group: 'Main',
    items: [
      { name: 'Dashboard',     href: '/dashboard',           icon: Home,          roles: ['student', 'employer', 'admin', 'superadmin'] },
    ],
  },
  {
    group: 'Prepare',
    items: [
      { name: 'Practice',       href: '/aptitude',           icon: BookOpen,      roles: ['guest', 'student'] },
      { name: 'Daily Challenge', href: '/aptitude/daily',    icon: CalendarDays,  roles: ['student'] },
      { name: 'Analytics',      href: '/aptitude/analytics', icon: BarChart3,     roles: ['student'] },
      { name: 'Leaderboard',    href: '/aptitude/leaderboard', icon: Trophy,      roles: ['student'] },
      { name: 'Roadmaps',       href: '/roadmap',            icon: Map,           roles: ['guest', 'student'] },
      { name: 'Companies',      href: '/companies',          icon: Building2,     roles: ['guest', 'student'] },
      { name: 'Blog',           href: '/blogs',              icon: FileText,      roles: ['guest', 'student'] },
    ],
  },
  {
    group: 'Opportunities',
    items: [
      { name: 'Jobs',          href: '/jobs',                icon: Briefcase,     roles: ['guest', 'student'] },
      { name: 'Applications',  href: '/applications',        icon: FileText,      roles: ['student'] },
    ],
  },
  {
    group: 'Employer',
    items: [
      { name: 'Dashboard',     href: '/employer/dashboard',  icon: Home,          roles: ['employer', 'admin', 'superadmin'] },
      { name: 'Post a Job',    href: '/employer/post-job',   icon: Plus,          roles: ['employer', 'admin', 'superadmin'] },
    ],
  },
  {
    group: 'Admin',
    items: [
      { name: 'Overview',      href: '/admin',               icon: Shield,        roles: ['admin', 'superadmin'] },
      { name: 'Users',         href: '/admin/users',         icon: Users,         roles: ['admin', 'superadmin'] },
      { name: 'Questions',     href: '/admin/questions',     icon: BookOpen,      roles: ['admin', 'superadmin'] },
      { name: 'Companies',     href: '/admin/companies',     icon: Building2,     roles: ['admin', 'superadmin'] },
      { name: 'Jobs',          href: '/admin/jobs',          icon: Briefcase,     roles: ['admin', 'superadmin'] },
    ],
  },
  {
    group: 'Account',
    items: [
      { name: 'Profile',       href: '/profile',             icon: User,          roles: ['student', 'employer', 'admin', 'superadmin'] },
      { name: 'Settings',      href: '/settings',            icon: Settings,      roles: ['student', 'employer', 'admin', 'superadmin'] },
    ],
  },
];

function NavGroup({ group, items, userRole, location, onNavClick }) {
  const isGuest = !userRole;
  const displayRole = userRole || 'student';
  const visibleItems = items.filter(i => i.roles.includes(displayRole));
  
  if (visibleItems.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
        {group}
      </p>
      <ul className="space-y-0.5 mt-1">
        {visibleItems.map(item => {
          const isLocked = isGuest && !item.roles.includes('guest');
          const isActive = !isLocked && (location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href)));
            
          return (
            <li key={item.href}>
              <Link
                to={isLocked ? '/auth/login' : item.href}
                onClick={onNavClick}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                } ${isLocked ? 'opacity-80' : ''}`}
              >
                {/* Active indicator */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-full" />
                )}
                <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="flex-1">{item.name}</span>
                {isLocked && <Lock className="w-4 h-4 opacity-50 shrink-0" />}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dismissed_announcements') || '[]'); } catch { return []; }
  });

  // Fetch announcements once on mount
  useEffect(() => {
    getAnnouncements()
      .then(data => setAnnouncements(data.data?.announcements || []))
      .catch(() => {}); // Silent fail
  }, []);

  const visibleAnnouncements = announcements.filter(a => !dismissedIds.includes(a._id));

  const dismissAnnouncement = (id) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try { sessionStorage.setItem('dismissed_announcements', JSON.stringify(updated)); } catch {}
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isPro =
    user?.subscription?.plan === 'pro' &&
    user?.subscription?.status === 'active' &&
    new Date(user?.subscription?.expiresAt) > new Date();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-border shrink-0">
        <Link to="/" className="text-lg font-bold text-foreground flex items-center gap-2.5">
          <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-sm font-black">P</span>
          Prepster
        </Link>
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          onClick={() => setMobileOpen(false)}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Pro upgrade nudge */}
      {!isPro && user?.role === 'student' && (
        <div className="mx-3 mt-4">
          <Link
            to="/upgrade"
            className="flex items-center gap-2.5 bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 text-sm font-semibold text-primary hover:bg-primary/15 transition-colors group"
          >
            <Zap className="w-4 h-4" />
            <span className="flex-1">Upgrade to Pro</span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {NAV.map(({ group, items }) => (
          <NavGroup
            key={group}
            group={group}
            items={items}
            userRole={user?.role}
            location={location}
            onNavClick={() => setMobileOpen(false)}
          />
        ))}
      </nav>

      {/* User / Guest footer */}
      <div className="border-t border-border p-4 shrink-0">
        {user ? (
          <>
            <div className="flex items-center gap-3 px-1 mb-3">
              <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center text-foreground font-bold text-sm overflow-hidden shrink-0">
                {user?.profile?.avatar
                  ? <img src={user.profile.avatar} alt="Avatar" className="h-full w-full object-cover" />
                  : user?.profile?.firstName?.charAt(0) || 'U'
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate leading-tight">
                  {user?.profile?.firstName} {user?.profile?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              {isPro && (
                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md border border-primary/20 shrink-0">
                  PRO
                </span>
              )}
            </div>
            <div className="flex items-center justify-between mt-3 px-1">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
                onClick={() => logout()}
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Sign out
              </Button>
              <div className="flex items-center gap-1">
                <NotificationBell announcements={visibleAnnouncements} dismissAnnouncement={dismissAnnouncement} direction="up" align="left" />
                <ThemeToggle />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3 px-1">
            <Link to="/auth/login">
              <Button className="w-full">Log In / Sign Up</Button>
            </Link>
            <div className="flex items-center justify-center pt-2 border-t border-border/50">
              <ThemeToggle />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-[260px] flex-col bg-card border-r border-border shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-[260px] max-w-[85vw] bg-card border-r border-border z-10 animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex h-14 sm:h-16 items-center justify-between border-b border-border bg-card px-3 sm:px-4 shrink-0 gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0 -ml-1"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/" className="text-base sm:text-lg font-bold text-foreground flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="w-6 h-6 sm:w-7 sm:h-7 bg-primary rounded-lg flex items-center justify-center text-primary-foreground text-xs font-black shrink-0">P</span>
              <span className="truncate">Prepster</span>
            </Link>
          </div>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
            <NotificationBell announcements={visibleAnnouncements} dismissAnnouncement={dismissAnnouncement} direction="down" align="mobile-header" />
            <ThemeToggle />
            <Link to="/profile" className="hidden sm:flex w-9 h-9 rounded-full bg-secondary items-center justify-center text-foreground font-bold text-sm overflow-hidden border border-border shrink-0 ml-1">
              {user?.profile?.avatar ? (
                <img src={user.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.profile?.firstName?.charAt(0) || 'U'
              )}
            </Link>
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

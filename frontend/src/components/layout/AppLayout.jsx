import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { getAnnouncements } from '@/api/notifications';
import { NotificationBell } from '@/components/ui/NotificationBell';
import {
  Home, User, Settings, LogOut, BookOpen, Briefcase, BarChart3,
  Building2, Zap, Shield, CalendarDays, Menu, X, Plus, Users,
  FileText, ChevronRight, Map, Trophy, Bell, Info, AlertTriangle, CheckCircle2, Lock, Calculator, Video, Bookmark, Target, GraduationCap, ArrowRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import OnboardingModal from '../features/OnboardingModal';

// ─── Nav config for logged-in users ─────────────────────────────────────────
const getNavConfig = (user) => {
  const isMba = user?.stream === 'mba';
  
  return [
    {
      group: 'Main',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['student', 'employer', 'admin', 'superadmin'] },
      ],
    },
    {
      group: 'Core Preparation',
      items: [
        { name: isMba ? 'CAT/XAT Prep' : 'Aptitude Practice', href: '/aptitude', icon: BookOpen, roles: ['student'] },
        { name: 'Daily Challenge', href: '/aptitude/daily', icon: CalendarDays, roles: ['student'] },
        { name: isMba ? 'Consulting Tracks' : 'Company Tracks', href: '/companies', icon: Building2, roles: ['student'] },
        { name: 'Roadmaps', href: '/roadmap', icon: Map, roles: ['student'] },
      ],
    },
    ...(isMba ? [{
      group: 'MBA Interviews',
      items: [
        { name: 'GD Practice',    href: '/mba/gd',             icon: Users,      roles: ['student'] },
        { name: 'PI Prep',        href: '/mba/pi',             icon: Target,     roles: ['student'] },
        { name: 'Case Studies',   href: '/mba/cases',          icon: BookOpen,   roles: ['student'] },
        { name: 'WAT Practice',   href: '/mba/wat',            icon: FileText,   roles: ['student'] },
        { name: 'Guesstimates',   href: '/mba/guesstimates',   icon: Calculator, roles: ['student'] },
        { name: 'Sector Explore', href: '/mba/sectors',        icon: Briefcase,  roles: ['student'] },
        { name: 'Mock Interview', href: '/mba/mock-interview',  icon: Video,      roles: ['student'] },
      ]
    }] : []),
    {
      group: 'Analytics & Progress',
      items: [
        { name: 'Performance Analytics', href: '/aptitude/analytics', icon: BarChart3, roles: ['student'] },
        { name: 'Leaderboard', href: '/aptitude/leaderboard', icon: Trophy, roles: ['student'] },
        ...(isMba ? [{ name: 'MBA Analytics',  href: '/mba/analytics', icon: BarChart3, roles: ['student'] }] : []),
      ],
    },
    {
      group: 'Resources',
      items: [
        { name: 'Saved Items', href: '/saved', icon: Bookmark, roles: ['student'] },
        { name: 'Blog & Insights', href: '/blogs', icon: FileText, roles: ['student'] },
      ],
    },
    {
      group: 'Opportunities',
      items: [
        { name: 'Jobs', href: '/jobs', icon: Briefcase, roles: ['student'] },
        { name: 'Applications', href: '/applications', icon: FileText, roles: ['student'] },
      ],
    },
    {
      group: 'Employer',
      items: [
        { name: 'Dashboard',  href: '/employer/dashboard', icon: Home,     roles: ['employer', 'admin', 'superadmin'] },
        { name: 'Post a Job', href: '/employer/post-job',  icon: Plus,     roles: ['employer', 'admin', 'superadmin'] },
      ],
    },
    {
      group: 'Admin',
      items: [
        { name: 'Overview',   href: '/admin',           icon: Shield,    roles: ['admin', 'superadmin'] },
        { name: 'Users',      href: '/admin/users',     icon: Users,     roles: ['admin', 'superadmin'] },
        { name: 'Questions',  href: '/admin/questions', icon: BookOpen,  roles: ['admin', 'superadmin'] },
        { name: 'Companies',  href: '/admin/companies', icon: Building2, roles: ['admin', 'superadmin'] },
        { name: 'Jobs',       href: '/admin/jobs',      icon: Briefcase, roles: ['admin', 'superadmin'] },
      ],
    },
    {
      group: 'Account',
      items: [
        { name: 'Profile',  href: '/profile',        icon: User,     roles: ['student', 'employer', 'admin', 'superadmin'] },
        { name: 'Resume',   href: '/profile/resume', icon: FileText, roles: ['student'] },
        { name: 'Settings', href: '/settings',       icon: Settings, roles: ['student', 'employer', 'admin', 'superadmin'] },
      ],
    },
  ];
};

// ─── Nav configs for guests (Engineering & MBA) ───────────────────────────────
const ENGINEERING_GUEST_NAV = [
  {
    group: 'Practice',
    color: 'blue',
    items: [
      { name: 'Aptitude Practice', href: '/aptitude',   icon: BookOpen  },
      { name: 'Roadmaps',          href: '/roadmap',    icon: Map       },
      { name: 'Companies',         href: '/companies',  icon: Building2 },
    ],
  },
  {
    group: 'Opportunities',
    color: 'green',
    items: [
      { name: 'Jobs',  href: '/jobs',  icon: Briefcase },
    ],
  },
  {
    group: 'Resources',
    color: 'purple',
    items: [
      { name: 'Blog', href: '/blogs', icon: FileText },
    ],
  },
];

const MBA_GUEST_NAV = [
  {
    group: 'MBA Prep',
    color: 'violet',
    items: [
      { name: 'GD Practice',    href: '/mba/gd',           icon: Users      },
      { name: 'PI Prep',        href: '/mba/pi',           icon: Target     },
      { name: 'Case Studies',   href: '/mba/cases',        icon: BookOpen   },
      { name: 'WAT Practice',   href: '/mba/wat',          icon: FileText   },
      { name: 'Sector Explore', href: '/mba/sectors',      icon: Briefcase  },
      { name: 'Guesstimates',   href: '/mba/guesstimates', icon: Calculator },
    ],
  },
  {
    group: 'Opportunities',
    color: 'green',
    items: [
      { name: 'Jobs', href: '/jobs', icon: Briefcase },
    ],
  },
  {
    group: 'Resources',
    color: 'purple',
    items: [
      { name: 'Blog', href: '/blogs', icon: FileText },
    ],
  },
];

// ─── NavGroup (logged-in users) ───────────────────────────────────────────────
function NavGroup({ group, items, userRole, location, onNavClick }) {
  const visibleItems = items.filter(i => i.roles.includes(userRole));
  if (visibleItems.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
        {group}
      </p>
      <ul className="space-y-0.5 mt-1">
        {visibleItems.map(item => {
          const isActive = location.pathname === item.href ||
            (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={onNavClick}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-full" />
                )}
                <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="flex-1">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── GuestNavGroup (public visitors) ─────────────────────────────────────────
function GuestNavGroup({ group, items, location, onNavClick }) {
  return (
    <div className="mb-4">
      <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 select-none">
        {group}
      </p>
      <ul className="space-y-0.5 mt-1">
        {items.map(item => {
          const isActive = location.pathname === item.href ||
            (location.pathname.startsWith(item.href) && item.href !== '/');
          return (
            <li key={item.href}>
              <Link
                to={item.href}
                onClick={onNavClick}
                className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-full" />
                )}
                <item.icon className="w-[18px] h-[18px] shrink-0" strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="flex-1">{item.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ─── AppLayout ────────────────────────────────────────────────────────────────
export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('dismissed_announcements') || '[]'); } catch { return []; }
  });

  // Guest stream preference — persisted in localStorage
  const [guestStream, setGuestStream] = useState(() => {
    try { return localStorage.getItem('prepster_guest_stream') || 'engineering'; } catch { return 'engineering'; }
  });

  const setGuestStreamPersist = (stream) => {
    setGuestStream(stream);
    try { localStorage.setItem('prepster_guest_stream', stream); } catch {}
  };

  useEffect(() => {
    getAnnouncements()
      .then(data => setAnnouncements(data.data?.announcements || []))
      .catch(() => {});
  }, []);

  const visibleAnnouncements = announcements.filter(a => !dismissedIds.includes(a._id));

  const dismissAnnouncement = (id) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    try { sessionStorage.setItem('dismissed_announcements', JSON.stringify(updated)); } catch {}
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isPro =
    user?.subscription?.plan === 'pro' &&
    user?.subscription?.status === 'active' &&
    new Date(user?.subscription?.expiresAt) > new Date();

  const guestNav = guestStream === 'mba' ? MBA_GUEST_NAV : ENGINEERING_GUEST_NAV;

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

      {/* Pro upgrade nudge (logged-in free users) */}
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

      {/* ── GUEST: Stream Picker ── */}
      {!user && (
        <div className="mx-3 mt-4 shrink-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-2 px-1">
            I'm preparing for
          </p>
          <div className="grid grid-cols-2 gap-1.5 bg-secondary/60 rounded-xl p-1 border border-border">
            <button
              onClick={() => setGuestStreamPersist('engineering')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-bold transition-all ${
                guestStream === 'engineering'
                  ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 shrink-0" />
              Engineering
            </button>
            <button
              onClick={() => setGuestStreamPersist('mba')}
              className={`flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs font-bold transition-all ${
                guestStream === 'mba'
                  ? 'bg-violet-500 text-white shadow-sm shadow-violet-500/30'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              MBA
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        {user ? (
          // Logged-in nav
          getNavConfig(user).map(({ group, items }) => (
            <NavGroup
              key={group}
              group={group}
              items={items}
              userRole={user?.role}
              location={location}
              onNavClick={() => setMobileOpen(false)}
            />
          ))
        ) : (
          // Guest nav — stream-specific sections
          <>
            {/* Track banner */}
            <div className={`mx-2 mb-4 px-3 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              guestStream === 'mba'
                ? 'bg-violet-500/10 border-violet-500/20 text-violet-500'
                : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
            }`}>
              {guestStream === 'mba'
                ? <><Users className="w-3.5 h-3.5 shrink-0" /> MBA Placement Track</>
                : <><GraduationCap className="w-3.5 h-3.5 shrink-0" /> Engineering Placement Track</>
              }
            </div>

            {guestNav.map(({ group, items }) => (
              <GuestNavGroup
                key={group}
                group={group}
                items={items}
                location={location}
                onNavClick={() => setMobileOpen(false)}
              />
            ))}

            {/* Cross-track discovery nudge */}
            <div className="mx-2 mt-2 mb-1">
              <button
                onClick={() => setGuestStreamPersist(guestStream === 'mba' ? 'engineering' : 'mba')}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
              >
                {guestStream === 'mba'
                  ? <><GraduationCap className="w-3.5 h-3.5 shrink-0" /> Switch to Engineering Track</>
                  : <><Users className="w-3.5 h-3.5 shrink-0" /> Switch to MBA Track</>
                }
                <ArrowRight className="w-3 h-3 ml-auto opacity-50" />
              </button>
            </div>
          </>
        )}
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
          <div className="flex flex-col gap-2 px-1">
            <Link to="/auth/register" state={{ stream: guestStream }}>
              <Button className="w-full font-semibold h-9">Create Free Account</Button>
            </Link>
            <Link to="/auth/login">
              <Button variant="outline" className="w-full text-sm h-9">Log in</Button>
            </Link>
            <div className="flex items-center justify-center pt-2 border-t border-border/50 mt-1">
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
      
      {/* Modals & Overlays */}
      <OnboardingModal />
    </div>
  );
}

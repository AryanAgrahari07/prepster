import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import {
  LayoutDashboard, BookOpen, Upload, Building2, ClipboardList,
  Briefcase, FileText, Users, CreditCard, Tag, Megaphone,
  ChevronLeft, ChevronRight, LogOut, ArrowLeft, Shield, Menu, X, GraduationCap
} from 'lucide-react';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Content',
    items: [
      { to: '/admin/questions', label: 'Question Bank', icon: BookOpen },
      { to: '/admin/questions/bulk', label: 'Bulk Import', icon: Upload },
      { to: '/admin/companies', label: 'Company Tracks', icon: Building2 },
      { to: '/admin/mock-tests', label: 'Mock Tests', icon: ClipboardList },
      { to: '/admin/blogs', label: 'Blog Posts', icon: FileText },
    ],
  },
  {
    label: 'MBA Content',
    items: [
      { to: '/admin/mba', label: 'MBA Manager', icon: GraduationCap },
    ],
  },
  {
    label: 'Platform',
    items: [
      { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
      { to: '/admin/applications', label: 'Applications', icon: FileText },
      { to: '/admin/users', label: 'Users', icon: Users },
      { to: '/admin/subscriptions', label: 'Subscriptions', icon: CreditCard },
    ],
  },
  {
    label: 'Config',
    items: [
      { to: '/admin/coupons', label: 'Coupons', icon: Tag },
      { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
];

function NavItem({ to, label, icon: Icon, end, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group
        ${isActive
          ? 'bg-primary text-primary-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
        }`
      }
    >
      <Icon className="w-4 h-4 shrink-0" />
      {!collapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside
      className={`
        flex flex-col bg-card border-r border-border h-full
        transition-all duration-300 ease-in-out overflow-hidden
        ${mobile ? 'w-64' : collapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo / Brand */}
      <div className={`flex items-center h-16 border-b border-border px-3 shrink-0 ${collapsed && !mobile ? 'justify-center' : 'justify-between'}`}>
        {(!collapsed || mobile) && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">Prepster</p>
              <p className="text-xs text-primary font-medium leading-tight">Admin Panel</p>
            </div>
          </div>
        )}
        {collapsed && !mobile && (
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary-foreground" />
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navSections.map(section => (
          <div key={section.label}>
            {(!collapsed || mobile) && (
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavItem
                  key={item.to}
                  {...item}
                  collapsed={collapsed && !mobile}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={`border-t border-border p-3 space-y-1 shrink-0 ${collapsed && !mobile ? 'flex flex-col items-center' : ''}`}>
        <Link
          to="/dashboard"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          {(!collapsed || mobile) && <span>Back to App</span>}
        </Link>

        {(!collapsed || mobile) && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-secondary/30">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
              {user?.profile?.firstName?.[0] || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">{user?.profile?.firstName} {user?.profile?.lastName}</p>
              <p className="text-xs text-primary capitalize">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {collapsed && !mobile && (
          <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground">
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full z-10">
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-border bg-card shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm">Admin Panel</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

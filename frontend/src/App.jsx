import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { useEffect } from 'react';
import Toaster from './components/ui/Toaster';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import AuthVerified from './pages/auth/AuthVerified';
import GoogleSuccess from './pages/auth/GoogleSuccess';

// Layout
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Profile & Settings
import Profile from './pages/profile/Profile';
import Resume from './pages/profile/Resume';
import Settings from './pages/profile/Settings';
import SavedItems from './pages/profile/SavedItems';

// Aptitude
import PracticeHub from './pages/aptitude/PracticeHub';
import QuizSession from './pages/aptitude/QuizSession';
import AnalyticsDashboard from './pages/aptitude/Analytics';
import Leaderboard from './pages/aptitude/Leaderboard';
import QuizResult from './pages/aptitude/QuizResult';
import DailyChallenge from './pages/aptitude/DailyChallenge';
import TopicDetail from './pages/aptitude/TopicDetail';

// Roadmap
import Roadmap from './pages/roadmap/Roadmap';
import RoadmapDetail from './pages/roadmap/RoadmapDetail';

// MBA
import GdPracticeHub from './pages/mba/GdPracticeHub';
import PiPrepHub from './pages/mba/PiPrepHub';
import CaseStudyLibrary from './pages/mba/CaseStudyLibrary';
import WatPractice from './pages/mba/WatPractice';
import SectorExplore from './pages/mba/SectorExplore';
import GuesstimatePractice from './pages/mba/GuesstimatePractice';
import MbaAnalytics from './pages/mba/MbaAnalytics';
import MockInterviewSession from './pages/mba/MockInterviewSession';

// Companies
import CompanyList from './pages/company/CompanyList';
import CompanyTrack from './pages/company/CompanyTrack';
import ExperienceDetail from './pages/company/ExperienceDetail';

// Jobs
import JobFeed from './pages/jobs/JobFeed';
import JobDetail from './pages/jobs/JobDetail';
import Applications from './pages/jobs/Applications';

// Employer
import EmployerDashboard from './pages/employer/EmployerDashboard';
import JobApplicants from './pages/employer/JobApplicants';
import PostJob from './pages/employer/PostJob';
import EditJob from './pages/employer/EditJob';

// Subscription
import Upgrade from './pages/upgrade/Upgrade';

// Admin
import AdminLayout from './components/layout/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import QuestionBank from './pages/admin/QuestionBank';
import QuestionEditor from './pages/admin/QuestionEditor';
import BulkImport from './pages/admin/BulkImport';
import UserManagement from './pages/admin/UserManagement';
import UserDetail from './pages/admin/UserDetail';
import CompanyManager from './pages/admin/CompanyManager';
import CompanyEditor from './pages/admin/CompanyEditor';
import CompanyQuestionBank from './pages/admin/CompanyQuestionBank';
import MockTestManager from './pages/admin/MockTestManager';
import MockTestEditor from './pages/admin/MockTestEditor';
import JobManager from './pages/admin/JobManager';
import JobEditor from './pages/admin/JobEditor';
import ApplicationsManager from './pages/admin/ApplicationsManager';
import SubscriptionManager from './pages/admin/SubscriptionManager';
import CouponManager from './pages/admin/CouponManager';
import Announcements from './pages/admin/Announcements';
import BlogManager from './pages/admin/BlogManager';
import BlogEditor from './pages/admin/BlogEditor';
import MbaContentManager from './pages/admin/MbaContentManager';
import MbaContentEditor from './pages/admin/MbaContentEditor';

// Blog (Public)
import BlogList from './pages/blog/BlogList';
import BlogPost from './pages/blog/BlogPost';

// Landing & Dashboard
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';

// Static Pages
import About from './pages/static/About';
import Contact from './pages/static/Contact';
import Privacy from './pages/static/Privacy';
import Terms from './pages/static/Terms';
import FAQ from './pages/static/FAQ';
import NotFound from './pages/static/NotFound';
import StaticLayout from './components/layout/StaticLayout';

// ─── Placeholders ─────────────────────────────────────────────────────────────

const ComingSoon = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <p className="text-4xl font-bold mb-4">🚧</p>
    <h1 className="text-2xl font-bold mb-2">{label || 'Coming soon'}</h1>
    <p className="text-muted-foreground">This page is under construction.</p>
  </div>
);

// ─── Protected Route Wrapper ──────────────────────────────────────────────────
const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, isHydrated, user } = useAuthStore();
  const location = useLocation();

  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center text-muted-foreground">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return <Navigate to="/auth/login" state={{ from: location }} replace />;

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ? children : <Outlet />;
};

// ─── App ──────────────────────────────────────────────────────────────────────
function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <ErrorBoundary>
        <Toaster />
        <Routes>
          {/* ── Public Routes ── */}
          <Route path="/" element={<Landing />} />
          <Route path="/about" element={<StaticLayout><About /></StaticLayout>} />
          <Route path="/contact" element={<StaticLayout><Contact /></StaticLayout>} />
          <Route path="/privacy" element={<StaticLayout><Privacy /></StaticLayout>} />
          <Route path="/terms" element={<StaticLayout><Terms /></StaticLayout>} />
          <Route path="/faq" element={<StaticLayout><FAQ /></StaticLayout>} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/auth/forgot-password" element={<ForgotPassword />} />
          <Route path="/auth/reset-password" element={<ResetPassword />} />
          <Route path="/auth/verified" element={<AuthVerified />} />
          <Route path="/auth/google/success" element={<GoogleSuccess />} />

          {/* ── App Layout (Handles both Public & Protected Routes) ── */}
          <Route element={<AppLayout />}>
            {/* Public/Mixed Routes */}
            <Route path="/aptitude" element={<PracticeHub />} />
            <Route path="/aptitude/topic/:topicId" element={<TopicDetail />} />
            
            <Route path="/roadmap" element={<Roadmap />} />
            <Route path="/roadmap/:track" element={<RoadmapDetail />} />
            
            <Route path="/companies" element={<CompanyList />} />
            <Route path="/companies/:slug" element={<CompanyTrack />} />
            <Route path="/companies/:slug/experiences/:idx" element={<ExperienceDetail />} />
            
            <Route path="/jobs" element={<JobFeed />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/blogs/:slug" element={<BlogPost />} />

            {/* MBA Public/Browse Routes — accessible without login */}
            <Route path="/mba/gd" element={<GdPracticeHub />} />
            <Route path="/mba/pi" element={<PiPrepHub />} />
            <Route path="/mba/cases" element={<CaseStudyLibrary />} />
            <Route path="/mba/wat" element={<WatPractice />} />
            <Route path="/mba/sectors" element={<SectorExplore />} />
            <Route path="/mba/guesstimates" element={<GuesstimatePractice />} />

            {/* Upgrade — publicly accessible for pricing browsing */}
            <Route path="/upgrade" element={<Upgrade />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/resume" element={<Resume />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/saved" element={<SavedItems />} />
              <Route path="/applications" element={<Applications />} />
              
              <Route path="/aptitude/daily" element={<DailyChallenge />} />
              <Route path="/aptitude/session/:id" element={<QuizSession />} />
              <Route path="/aptitude/results/:id" element={<QuizResult />} />
              <Route path="/aptitude/analytics" element={<AnalyticsDashboard />} />
              <Route path="/aptitude/leaderboard" element={<Leaderboard />} />
              
              {/* MBA Protected Routes — require login (personal/session-based) */}
              <Route path="/mba/analytics" element={<MbaAnalytics />} />
              <Route path="/mba/mock-interview" element={<MockInterviewSession />} />
            </Route>

            {/* Employer */}
            <Route
              path="/employer/dashboard"
              element={
                <ProtectedRoute roles={['employer', 'admin', 'superadmin']}>
                  <EmployerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs/:id/applicants"
              element={
                <ProtectedRoute roles={['employer', 'admin', 'superadmin']}>
                  <JobApplicants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/post-job"
              element={
                <ProtectedRoute roles={['employer', 'admin', 'superadmin']}>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employer/jobs/:id/edit"
              element={
                <ProtectedRoute roles={['employer', 'admin', 'superadmin']}>
                  <EditJob />
                </ProtectedRoute>
              }
            />

          </Route>

          {/* Admin Panel Layout & Routes */}
          <Route element={<ProtectedRoute roles={['admin', 'superadmin']}><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/questions" element={<QuestionBank />} />
            <Route path="/admin/questions/new" element={<QuestionEditor />} />
            <Route path="/admin/questions/:id/edit" element={<QuestionEditor />} />
            <Route path="/admin/questions/bulk" element={<BulkImport />} />
            
            <Route path="/admin/companies" element={<CompanyManager />} />
            <Route path="/admin/companies/new" element={<CompanyEditor />} />
            <Route path="/admin/companies/:id/edit" element={<CompanyEditor />} />
            <Route path="/admin/companies/:slug/questions" element={<CompanyQuestionBank />} />
            
            <Route path="/admin/mock-tests" element={<MockTestManager />} />
            <Route path="/admin/mock-tests/new" element={<MockTestEditor />} />
            <Route path="/admin/mock-tests/:id/edit" element={<MockTestEditor />} />
            
            <Route path="/admin/jobs" element={<JobManager />} />
            <Route path="/admin/jobs/new" element={<JobEditor />} />
            <Route path="/admin/jobs/:id/edit" element={<JobEditor />} />
            <Route path="/admin/applications" element={<ApplicationsManager />} />
            
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/users/:id" element={<UserDetail />} />
            
            <Route path="/admin/subscriptions" element={<SubscriptionManager />} />
            <Route path="/admin/coupons" element={<CouponManager />} />
            <Route path="/admin/announcements" element={<Announcements />} />
            
            <Route path="/admin/blogs" element={<BlogManager />} />
            <Route path="/admin/blogs/new" element={<BlogEditor />} />
            <Route path="/admin/blogs/:id/edit" element={<BlogEditor />} />

            <Route path="/admin/mba" element={<MbaContentManager />} />
            <Route path="/admin/mba/new" element={<MbaContentEditor />} />
            <Route path="/admin/mba/:id/edit" element={<MbaContentEditor />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </div>
  );
}

export default App;

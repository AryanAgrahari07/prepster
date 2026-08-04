import { Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuthStore from './store/authStore';
import { useEffect, lazy, Suspense } from 'react';
import Toaster from './components/ui/Toaster';
import AnalyticsTracker from './components/AnalyticsTracker';

// Auth pages
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));
const AuthVerified = lazy(() => import('./pages/auth/AuthVerified'));
const GoogleSuccess = lazy(() => import('./pages/auth/GoogleSuccess'));
const VerifyOtp = lazy(() => import('./pages/auth/VerifyOtp'));

// Layout
import AppLayout from './components/layout/AppLayout';
import ErrorBoundary from './components/ErrorBoundary';

// Profile & Settings
const Profile = lazy(() => import('./pages/profile/Profile'));
const Resume = lazy(() => import('./pages/profile/Resume'));
const Settings = lazy(() => import('./pages/profile/Settings'));
const SavedItems = lazy(() => import('./pages/profile/SavedItems'));

// Aptitude
const PracticeHub = lazy(() => import('./pages/aptitude/PracticeHub'));
const QuizSession = lazy(() => import('./pages/aptitude/QuizSession'));
const AnalyticsDashboard = lazy(() => import('./pages/aptitude/Analytics'));
const Leaderboard = lazy(() => import('./pages/aptitude/Leaderboard'));
const QuizResult = lazy(() => import('./pages/aptitude/QuizResult'));
const DailyChallenge = lazy(() => import('./pages/aptitude/DailyChallenge'));
const TopicDetail = lazy(() => import('./pages/aptitude/TopicDetail'));

// Roadmap
const Roadmap = lazy(() => import('./pages/roadmap/Roadmap'));
const RoadmapDetail = lazy(() => import('./pages/roadmap/RoadmapDetail'));

// MBA
const GdPracticeHub = lazy(() => import('./pages/mba/GdPracticeHub'));
const PiPrepHub = lazy(() => import('./pages/mba/PiPrepHub'));
const CaseStudyLibrary = lazy(() => import('./pages/mba/CaseStudyLibrary'));
const WatPractice = lazy(() => import('./pages/mba/WatPractice'));
const SectorExplore = lazy(() => import('./pages/mba/SectorExplore'));
const GuesstimatePractice = lazy(() => import('./pages/mba/GuesstimatePractice'));
const MbaAnalytics = lazy(() => import('./pages/mba/MbaAnalytics'));
const MockInterviewSession = lazy(() => import('./pages/mba/MockInterviewSession'));

// Companies
const CompanyList = lazy(() => import('./pages/company/CompanyList'));
const CompanyTrack = lazy(() => import('./pages/company/CompanyTrack'));
const ExperienceDetail = lazy(() => import('./pages/company/ExperienceDetail'));

// Jobs
const JobFeed = lazy(() => import('./pages/jobs/JobFeed'));
const JobDetail = lazy(() => import('./pages/jobs/JobDetail'));
const Applications = lazy(() => import('./pages/jobs/Applications'));

// Employer
const EmployerDashboard = lazy(() => import('./pages/employer/EmployerDashboard'));
const JobApplicants = lazy(() => import('./pages/employer/JobApplicants'));
const PostJob = lazy(() => import('./pages/employer/PostJob'));
const EditJob = lazy(() => import('./pages/employer/EditJob'));

// Subscription
const Upgrade = lazy(() => import('./pages/upgrade/Upgrade'));

// Admin
import AdminLayout from './components/layout/AdminLayout';
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview'));
const QuestionBank = lazy(() => import('./pages/admin/QuestionBank'));
const QuestionEditor = lazy(() => import('./pages/admin/QuestionEditor'));
const BulkImport = lazy(() => import('./pages/admin/BulkImport'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const UserDetail = lazy(() => import('./pages/admin/UserDetail'));
const CompanyManager = lazy(() => import('./pages/admin/CompanyManager'));
const CompanyEditor = lazy(() => import('./pages/admin/CompanyEditor'));
const CompanyQuestionBank = lazy(() => import('./pages/admin/CompanyQuestionBank'));
const MockTestManager = lazy(() => import('./pages/admin/MockTestManager'));
const MockTestEditor = lazy(() => import('./pages/admin/MockTestEditor'));
const JobManager = lazy(() => import('./pages/admin/JobManager'));
const JobEditor = lazy(() => import('./pages/admin/JobEditor'));
const ApplicationsManager = lazy(() => import('./pages/admin/ApplicationsManager'));
const SubscriptionManager = lazy(() => import('./pages/admin/SubscriptionManager'));
const CouponManager = lazy(() => import('./pages/admin/CouponManager'));
const Announcements = lazy(() => import('./pages/admin/Announcements'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));
const BlogEditor = lazy(() => import('./pages/admin/BlogEditor'));
const MbaContentManager = lazy(() => import('./pages/admin/MbaContentManager'));
const MbaContentEditor = lazy(() => import('./pages/admin/MbaContentEditor'));

// Blog (Public)
const BlogList = lazy(() => import('./pages/blog/BlogList'));
const BlogPost = lazy(() => import('./pages/blog/BlogPost'));

// Landing & Dashboard
const Landing = lazy(() => import('./pages/Landing'));
const Dashboard = lazy(() => import('./pages/Dashboard'));

// Static Pages
const About = lazy(() => import('./pages/static/About'));
const Contact = lazy(() => import('./pages/static/Contact'));
const Privacy = lazy(() => import('./pages/static/Privacy'));
const Terms = lazy(() => import('./pages/static/Terms'));
const FAQ = lazy(() => import('./pages/static/FAQ'));
const NotFound = lazy(() => import('./pages/static/NotFound'));
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
        <AnalyticsTracker />
        <Toaster />
        <Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center bg-background">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        }>
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
          <Route path="/auth/verify-otp" element={<VerifyOtp />} />
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
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

export default App;

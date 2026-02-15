import PerformanceReviewPage from "./pages/admin/PerformanceReviewPage";
import Feedback360Page from "./pages/admin/Feedback360Page";
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgetPassword from "@/pages/forgetpassword";
import NotFound from '@/pages/NotFound';
import AzureAuthCallback from '@/pages/AzureAuthCallback';
import PerformancePage from "./pages/admin/PerformancePage";
import MentorHub from '@/pages/mentor/MentorHub';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import InternDetails from '@/pages/admin/InternDetails';
import DSUBoard from '@/pages/admin/DSUBoard';
import TasksOverview from '@/pages/admin/TasksOverview';
import ReferenceManagement from '@/pages/admin/ReferenceManagement';
import BatchManagement from '@/pages/admin/BatchManagement';
import BatchDetails from '@/pages/admin/BatchDetails';
import ProjectManagement from '@/pages/admin/ProjectManagement';
import AdminApprovals from "./pages/admin/AdminApprovals";

// Scrum Master Pages
import ScrumMasterDashboard from '@/pages/scrum_master/ScrumMasterDashboard';
import ScrumMasterDSUBoard from '@/pages/scrum_master/DSUboard';

// Intern Pages
import InternDashboard from '@/pages/intern/InternDashboard';
import InternProfile from '@/pages/intern/InternProfile';
import DailyUpdates from '@/pages/intern/DailyUpdates';
import PTORequest from '@/pages/intern/PTORequest';
import { Toaster } from '@/components/ui/toaster';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import React from 'react';

// ============= Protected Route Component =============
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'intern' | 'scrum_master')[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role access
  if (allowedRoles && !allowedRoles.includes(user.role as any)) {
    // Redirect to appropriate dashboard based on role
    let redirectPath = '/intern';
    switch (user.role) {
      case 'admin':
        redirectPath = '/admin';
        break;
      case 'scrum_master':
        redirectPath = '/scrum-master';
        break;
      case 'intern':
      default:
        redirectPath = '/intern';
        break;
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

// ============= Public Route Component =============
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  // If already logged in, redirect to dashboard based on role
  if (isAuthenticated && user) {
    let redirectPath = '/intern';
    switch (user.role) {
      case 'admin':
        redirectPath = '/admin';
        break;
      case 'scrum_master':
        redirectPath = '/scrum-master';
        break;
      case 'intern':
      default:
        redirectPath = '/intern';
        break;
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};


// ============= App Routes Component =============
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ========== Public Routes ========== */}
      <Route path="/" element={<HomePage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/auth/azure-callback" element={<AzureAuthCallback />} />

      {/* ========== Admin Routes ========== */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
         <Route
        path="/admin/performance-review/:internId"
        element={
          <ProtectedRoute allowedRoles={['admin', 'scrum_master']}>
            <PerformanceReviewPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/interns"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/interns/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <InternDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/interns/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <InternDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dsu-board"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DSUBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TasksOverview />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/references"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ReferenceManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/batches"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BatchManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/batches/:id"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <BatchDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/approvals"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminApprovals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/projects"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ProjectManagement />
          </ProtectedRoute>
        }
      />
      {/* ✅ NEW: Performance Route */}
      <Route
        path="/admin/performance"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PerformancePage />
          </ProtectedRoute>
        }
      />

        {/* ✅ NEW: 360-Degree Feedback Route */}
        <Route
          path="/admin/feedback360/:internId"
          element={
            <ProtectedRoute allowedRoles={['admin', 'scrum_master']}>
              <Feedback360Page />
            </ProtectedRoute>
          }
        />

      {/* ========== Scrum Master Routes ========== */}
      <Route
        path="/scrum-master"
        element={
          <ProtectedRoute allowedRoles={['scrum_master', 'admin']}>
            <ScrumMasterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scrum-master/dsu-board"
        element={
          <ProtectedRoute allowedRoles={['scrum_master', 'admin']}>
            <ScrumMasterDSUBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scrum-master/daily-updates"
        element={
          <ProtectedRoute allowedRoles={['scrum_master', 'admin']}>
            <DailyUpdates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scrum-master/profile"
        element={
          <ProtectedRoute allowedRoles={['scrum_master']}>
            <InternProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/mentor"
        element={
          <ProtectedRoute allowedRoles={['intern', 'scrum_master', 'admin']}>
            <MentorHub />
          </ProtectedRoute>
        }
      />

      {/* ========== Intern Routes ========== */}
      
      <Route
        path="/intern"
        element={
          <ProtectedRoute allowedRoles={['intern', 'admin']}>
            <InternDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/dashboard"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <InternDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/profile"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <InternProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/daily-updates"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <DailyUpdates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/intern/pto-requests"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <PTORequest />
          </ProtectedRoute>
        }
      />


      {/* ========== Legacy Routes (Backward Compatibility) ========== */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <InternDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <InternProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/daily-updates"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <DailyUpdates />
          </ProtectedRoute>
        }
      />

      {/* ========== 404 Not Found ========== */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

// ============= Main App Component =============
const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// // Pages
// import HomePage from "./pages/HomePage";
// import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
// import InternDashboard from "./pages/intern/InternDashboard";
// import InternProfile from "./pages/intern/InternProfile";
// import DailyUpdates from '@/pages/intern/DailyUpdates';
// import AdminDashboard from "./pages/admin/AdminDashboard";
// import UserManagement from "./pages/admin/UserManagement";
// import DSUBoard from "./pages/admin/DSUBoard";
// import NotFound from "./pages/NotFound";

// const queryClient = new QueryClient();

// // Protected Route Component
// const ProtectedRoute = ({
//   children,
//   allowedRoles
// }: {
//   children: React.ReactNode;
//   allowedRoles?: ('admin' | 'intern' | 'mentor')[]
// }) => {
//   const { isAuthenticated, user } = useAuth();

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   if (allowedRoles && user && !allowedRoles.includes(user.role as 'admin' | 'intern' | 'mentor')) {
//     return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
//   }

//   return <>{children}</>;
// };

// // Public Route (redirects if authenticated)
// const PublicRoute = ({ children }: { children: React.ReactNode }) => {
//   const { isAuthenticated, user } = useAuth();

//   if (isAuthenticated && user) {
//     return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
//   }

//   return <>{children}</>;
// };

// const AppRoutes = () => {
//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route path="/" element={<HomePage />} />
//       <Route
//         path="/login"
//         element={
//           <PublicRoute>
//             <LoginPage />
//           </PublicRoute>
//         }
//       />
//       <Route
//         path="/register"
//         element={
//           <PublicRoute>
//             <RegisterPage />
//           </PublicRoute>
//         }
//       />

  

// {/* Intern Routes */}
// <Route
//   path="/dashboard"
//   element={
//     <ProtectedRoute allowedRoles={['intern']}>
//       <InternDashboard />  {/* ← Home/Overview page */}
//     </ProtectedRoute>
//   }
// />
// <Route
//   path="/dashboard/profile"
//   element={
//     <ProtectedRoute allowedRoles={['intern']}>
//       <InternProfile />
//     </ProtectedRoute>
//   }
// />
// <Route
//   path="/daily-updates"
//   element={
//     <ProtectedRoute allowedRoles={['intern']}>
//       <DailyUpdates />  {/* ← Task & DSU management */}
//     </ProtectedRoute>
//   }
// />


//       {/* Admin Routes */}
//       <Route
//         path="/admin"
//         element={
//           <ProtectedRoute allowedRoles={['admin']}>
//             <AdminDashboard />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/admin/interns"
//         element={
//           <ProtectedRoute allowedRoles={['admin']}>
//             <UserManagement />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/admin/dsu-board"
//         element={
//           <ProtectedRoute allowedRoles={['admin', 'mentor']}>  {/* ← CHANGED: Allow mentor too */}
//             <DSUBoard />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/admin/feedback"
//         element={
//           <ProtectedRoute allowedRoles={['admin']}>
//             <AdminDashboard />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/admin/settings"
//         element={
//           <ProtectedRoute allowedRoles={['admin']}>
//             <AdminDashboard />
//           </ProtectedRoute>
//         }
//       />

//       {/* Catch All */}
//       <Route path="*" element={<NotFound />} />
//     </Routes>
//   );
// };

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <BrowserRouter>
//         <AuthProvider>
//           <AppRoutes />
//         </AuthProvider>
//       </BrowserRouter>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;
// src/App.tsx

// ============= Page Imports =============
// Public Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import NotFound from '@/pages/NotFound';
import AzureAuthCallback from '@/pages/AzureAuthCallback';

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard';
import UserManagement from '@/pages/admin/UserManagement';
import AdminUserApproval from '@/pages/admin/AdminUserApproval';
import InternDetails from '@/pages/admin/InternDetails';
import DSUBoard from '@/pages/admin/DSUBoard';
import TasksOverview from '@/pages/admin/TasksOverview';
import PTOApproval from '@/pages/admin/PTOApproval';

// Scrum Master Pages
import ScrumMasterDashboard from '@/pages/scrum_master/ScrumMasterDashboard';
import ScrumMasterDSUBoard from '@/pages/scrum_master/DSUboard';

// Intern Pages
import InternDashboard from '@/pages/intern/InternDashboard';
import InternProfile from '@/pages/intern/InternProfile';
import DailyUpdates from '@/pages/intern/DailyUpdates'; 
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
        path="/admin/pto"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <PTOApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUserApproval />
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
        path="/scrum-master/projects"
        element={
          <ProtectedRoute allowedRoles={['scrum_master', 'admin']}>
            <ScrumMasterDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/scrum-master/interns"
        element={
          <ProtectedRoute allowedRoles={['scrum_master', 'admin']}>
            <UserManagement />
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

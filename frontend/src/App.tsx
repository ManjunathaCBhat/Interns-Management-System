import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

// Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import InternDashboard from "./pages/intern/InternDashboard";
import InternProfile from "./pages/intern/InternProfile";
import DailyUpdates from '@/pages/intern/DailyUpdates';
import AdminDashboard from "./pages/admin/AdminDashboard";
import InternManagement from "./pages/admin/InternManagement";
import DSUBoard from "./pages/admin/DSUBoard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles?: ('admin' | 'intern' | 'mentor')[]
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as 'admin' | 'intern' | 'mentor')) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

// Public Route (redirects if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
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

      {/* Intern Routes
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

      <Route
        path="/dashboard/dsu"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <InternDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute allowedRoles={['intern']}>
            <InternDashboard />
          </ProtectedRoute>
        }
      /> */}

{/* Intern Routes */}
<Route
  path="/dashboard"
  element={
    <ProtectedRoute allowedRoles={['intern']}>
      <InternDashboard />  {/* ← Home/Overview page */}
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
      <DailyUpdates />  {/* ← Task & DSU management */}
    </ProtectedRoute>
  }
/>


      {/* Admin Routes */}
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
            <InternManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/dsu-board"
        element={
          <ProtectedRoute allowedRoles={['admin', 'mentor']}>  {/* ← CHANGED: Allow mentor too */}
            <DSUBoard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/feedback"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

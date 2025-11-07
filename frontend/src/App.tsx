import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Lazy load pages for code splitting and better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ScribePage = lazy(() => import('./pages/ScribePage'));
const SynapsePage = lazy(() => import('./pages/SynapsePage'));
const LensPage = lazy(() => import('./pages/LensPage'));
const OratorPage = lazy(() => import('./pages/OratorPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));

// Protected Route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-synapse-background">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-synapse-background">
    <div className="loading-spinner" />
  </div>
);

function AppRoutes() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/scribe"
        element={
          <ProtectedRoute>
            <Layout>
              <ScribePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/synapse"
        element={
          <ProtectedRoute>
            <Layout>
              <SynapsePage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/lens"
        element={
          <ProtectedRoute>
            <Layout>
              <LensPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orator"
        element={
          <ProtectedRoute>
            <Layout>
              <OratorPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <AnalyticsPage />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
        <PWAInstallPrompt />
      </AuthProvider>
    </Router>
  );
}

export default App;

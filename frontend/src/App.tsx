import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ScribePage from './pages/ScribePage';
import SynapsePage from './pages/SynapsePage';
import LensPage from './pages/LensPage';
import OratorPage from './pages/OratorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

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

function AppRoutes() {
  return (
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
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;

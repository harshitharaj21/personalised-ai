import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import MissionViewPage from './pages/MissionViewPage';
import AdaptPage from './pages/AdaptPage';
import ProgressPage from './pages/ProgressPage';

// Route guard components
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, isOnboarded } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const OnboardingRoute = ({ children }) => {
  const { isAuthenticated, loading, isOnboarded } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isOnboarded) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRoute = ({ children }) => {
  const { isAuthenticated, loading, isOnboarded, hasProfile } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAuthenticated && !isOnboarded && hasProfile) return <Navigate to="/onboarding" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

const LoadingScreen = () => (
  <div className="min-h-screen bg-surface-900 bg-grid flex items-center justify-center">
    <div className="text-center animate-fade-in">
      <div className="relative inline-block mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-accent-500 flex items-center justify-center shadow-glow-md animate-bounce-gentle">
          <span className="text-white font-black text-2xl">N</span>
        </div>
        <div className="absolute -inset-1 bg-gradient-to-br from-brand-600 to-accent-500 rounded-2xl blur opacity-40 animate-pulse-slow" />
      </div>
      <div className="flex gap-1 justify-center">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/onboarding" element={<OnboardingRoute><OnboardingPage /></OnboardingRoute>} />
      <Route path="/dashboard" element={<DashboardRoute><DashboardPage /></DashboardRoute>} />
      <Route path="/mission/:id" element={<ProtectedRoute><MissionViewPage /></ProtectedRoute>} />
      <Route path="/adapt" element={<ProtectedRoute><AdaptPage /></ProtectedRoute>} />
      <Route path="/progress" element={<ProtectedRoute><ProgressPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

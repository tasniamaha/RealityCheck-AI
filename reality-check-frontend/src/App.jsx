import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

import LandingPage      from './pages/LandingPage';
import Login            from './pages/Login';
import Register         from './pages/Register';
import UserDashboard    from './pages/UserDashboard';
import ExpertRegister   from './pages/ExpertRegister';
import ExpertDashboard  from './pages/ExpertDashboard';
import AdminDashboard   from './pages/AdminDashboard';
import Methodology      from './pages/Methodology';
import ResearchPapers  from './pages/ResearchPapers';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent animate-spin rounded-full" />
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin'  && !allowedRoles.includes('admin'))  return <Navigate to="/admin-dashboard"  replace />;
  if (user.role === 'expert' && !allowedRoles.includes('expert')) return <Navigate to="/expert-dashboard" replace />;
  if (!allowedRoles.includes(user.role))                          return <Navigate to="/user-dashboard"   replace />;

  return children;
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
            <Route path="/"                element={<LandingPage />} />
            <Route path="/login"           element={<Login />} />
            <Route path="/register"        element={<Register />} />
            <Route path="/expert-register" element={<ExpertRegister />} />
            <Route path="/methodology"     element={<Methodology />} />
            <Route path="/research-papers" element={<ResearchPapers />} />

            <Route path="/user-dashboard" element={
              <ProtectedRoute allowedRoles={['user', 'expert', 'admin']}>
                <UserDashboard />
              </ProtectedRoute>
            } />
            <Route path="/expert-dashboard" element={
              <ProtectedRoute allowedRoles={['expert', 'admin']}>
                <ExpertDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import Welcome from './pages/Welcome';
import Analytics from './pages/Analytics';
import Audiences from './pages/Audiences';
import CreateAudience from './pages/CreateAudience';
import Activation from './pages/Activation';
import Setup from './pages/Setup';
import Admin from './pages/Admin';
import Superadmin from './pages/Superadmin';
import Profile from './pages/Profile';
import LoginPage from './pages/LoginPage';
import { CreateAudienceProvider } from './contexts/CreateAudienceContext';
import { useAuth } from './hooks/useAuth';

const PrivateLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};


const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a proper spinner
  }

  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={isAuthenticated ? <PrivateRoutes /> : <Navigate to="/login" />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

const PrivateRoutes = () => (
  <Routes>
    <Route element={<PrivateLayout />}>
      <Route path="/" element={<Welcome />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/audiences" element={<Audiences />} />
      <Route
        path="/audiences/create"
        element={
          <CreateAudienceProvider>
            <CreateAudience />
          </CreateAudienceProvider>
        }
      />
      <Route path="/activation" element={<Activation />} />
      <Route path="/setup/*" element={<Setup />} />
      <Route path="/admin/*" element={<Admin />} />
      <Route path="/superadmin/*" element={<Superadmin />} />
      <Route path="/profile" element={<Profile />} />
    </Route>
  </Routes>
);


export default App;

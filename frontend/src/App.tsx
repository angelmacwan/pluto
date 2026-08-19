import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { useAppStore } from './store/appStore';
import { ProjectsPage } from './pages/ProjectsPage';
import { EditorPage } from './pages/EditorPage';
import { LandingPage } from './pages/LandingPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAppStore();
  if (user === undefined) return <div style={{ height: '100vh', width: '100vw', background: 'var(--surface)' }} />;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function MainRoutes() {
  const { user } = useAppStore();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/app" replace /> : <LandingPage />} />
      <Route path="/app" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/editor/:projectId?" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <MainRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

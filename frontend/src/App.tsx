import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthProvider';
import { useAppStore } from './store/appStore';
import { LoginPage } from './components/auth/LoginPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { EditorPage } from './pages/EditorPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAppStore();
  if (user === undefined) return <div className="h-screen w-screen bg-[#0d0f13]" />; // Loading state
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function MainRoutes() {
  const { user } = useAppStore();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
      <Route path="/editor/:projectId?" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
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

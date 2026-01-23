import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import AIAssistant from './components/AIAssistant';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Lazy Load Pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LiveMap = lazy(() => import('./pages/LiveMap'));

const LandingPage = lazy(() => import('./pages/LandingPage')); // [NEW]
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));

import API_BASE_URL from "./config";
const API_BASE = API_BASE_URL;

// Loading Fallback
const PageLoader = () => (
  <div className="flex h-full w-full items-center justify-center bg-transparent">
    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Main Layout
const MainLayout = ({ children }) => (
  <div className="flex h-screen w-full bg-[#030712] text-slate-200 overflow-hidden font-outfit relative">
    <div className="mouse-glow" />
    <AIAssistant />
    <Sidebar />
    <main className="flex-1 h-full overflow-y-auto relative z-10 scrollbar-hide">
      <div className="page-sweep" />
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </main>
  </div>
);

function AppContent() {
  const navigate = useNavigate();

  // Mouse Glow Effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        <Suspense fallback={<PageLoader />}>
          <LandingPage />
        </Suspense>
      } />

      <Route path="/login" element={
        <Suspense fallback={<PageLoader />}>
          <LoginPage />
        </Suspense>
      } />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <div className="flex h-screen w-full bg-[#030712] text-slate-200 overflow-hidden font-outfit relative">
            <div className="mouse-glow" />
            <AIAssistant />
            <Dashboard />
          </div>
        </ProtectedRoute>
      } />

      {/* Map Route */}
      <Route path="/map" element={
        <ProtectedRoute>
          <MainLayout>
            <LiveMap />
          </MainLayout>
        </ProtectedRoute>
      } />



      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />

      <Route path="/analytics" element={
        <ProtectedRoute>
          <MainLayout>
            <Analytics />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import socket from './socket';

import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import VibeCinema from './pages/VibeCinema';
import PartnerLink from './pages/PartnerLink';
import MemoryWall from './pages/MemoryWall';
import TimeCapsule from './pages/TimeCapsule';
import DreamBoard from './pages/DreamBoard';
import SafeVault from './pages/SafeVault';
import SnapCenter from './pages/SnapCenter';
import Chat from './pages/Chat';
import WellnessSync from './pages/WellnessSync';
import VirtualPet from './pages/VirtualPet';
import Settings from './pages/Settings';
import GameCenter from './pages/GameCenter';
import BottomNav from './components/BottomNav';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
      <div className="illustration-float">
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent-coral)' }}>Loading...</h2>
      </div>
    </div>
  );
  if (!user) return <Navigate to="/auth" />;
  return children;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  useEffect(() => {
    const joinGlobalRoom = () => {
      if (user && user.userId) {
        const room = user.partnerId
          ? [user.userId.toString(), user.partnerId.toString()].sort().join("-")
          : user.userId.toString();

        console.log(`[Socket] Joining global room: ${room}`);
        socket.emit("join_room", room);
      }
    };

    joinGlobalRoom();
    socket.on("connect", joinGlobalRoom);

    return () => {
      socket.off("connect", joinGlobalRoom);
    };
  }, [user]);

  if (loading) return null;

  return (
    <Router>
      <div className="app-main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage type="login" />} />
          <Route path="/login" element={<AuthPage type="login" />} />
          <Route path="/signup" element={<AuthPage type="signup" />} />
          <Route path="/forgot" element={<AuthPage type="forgot" />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
              <BottomNav />
            </ProtectedRoute>
          } />

          <Route path="/link" element={
            <ProtectedRoute>
              <PartnerLink />
              <BottomNav />
            </ProtectedRoute>
          } />

          <Route path="/chat" element={
            <ProtectedRoute>
              <Chat />
              
            </ProtectedRoute>
          } />

          <Route path="/cinema" element={
            <ProtectedRoute>
              <VibeCinema />
            </ProtectedRoute>
          } />

          <Route path="/snaps" element={
            <ProtectedRoute>
              <SnapCenter />
              <BottomNav />
            </ProtectedRoute>
          } />

          <Route path="/vault" element={
            <ProtectedRoute>
              <SafeVault />
              <BottomNav />
            </ProtectedRoute>
          } />

          <Route path="/memory-wall" element={
            <ProtectedRoute>
              <MemoryWall />
              <BottomNav />
            </ProtectedRoute>
          } />

          <Route path="/capsule" element={
            <ProtectedRoute>
              <TimeCapsule />
              <BottomNav />
            </ProtectedRoute>
          } />

          <Route path="/time-capsule" element={
            <ProtectedRoute>
              <TimeCapsule />
              <BottomNav />
            </ProtectedRoute>
          } />

          <Route path="/dreams" element={
            <ProtectedRoute>
              <DreamBoard />
              <BottomNav />
            </ProtectedRoute>
          } />

          <Route path="/wellness" element={
            <ProtectedRoute>
              <WellnessSync />
              <BottomNav />
            </ProtectedRoute>
          } />

          <Route path="/pet" element={
            <ProtectedRoute>
              <VirtualPet />
              <BottomNav />
            </ProtectedRoute>
          } />

          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />

          <Route path="/games" element={
            <ProtectedRoute>
              <GameCenter />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

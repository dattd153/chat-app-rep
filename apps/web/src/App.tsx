import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import SideNavBar from './components/organisms/SideNavBar';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { NotificationProvider } from './context/NotificationContext';

const App: React.FC = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <NotificationProvider>
      <div className="flex bg-background h-screen w-screen overflow-hidden text-on-surface">
        {!isAuthPage && <SideNavBar />}
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Root and Fallback */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </NotificationProvider>
  );
};

export default App;

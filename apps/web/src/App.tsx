import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './index.css';
import SideNavBar from './components/organisms/SideNavBar';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import Profile from './pages/Profile';
import Login from './pages/Login';

const App: React.FC = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="flex bg-background h-screen w-screen overflow-hidden text-on-surface">
      {/* Conditionally render SideNavBar if not on login page */}
      {!isLoginPage && <SideNavBar />}

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/login" element={<Login />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  );
};

export default App;

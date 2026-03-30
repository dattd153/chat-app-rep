import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';

const SideNavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const navItems = [
    { icon: 'chat_bubble', label: 'Chats', path: '/dashboard' },
    { icon: 'group', label: 'Contacts', path: '/contacts' },
    { icon: 'person', label: 'Profile', path: '/profile' },
  ];

  return (
    <aside className="hidden md:flex flex-col py-8 space-y-2 bg-slate-100 dark:bg-slate-950 h-screen w-20 lg:w-64 fixed left-0 top-0 z-50 border-r border-outline-variant/10">
      {/* Logo Section */}
      <div className="flex items-center justify-center lg:justify-start px-3 lg:px-7 mb-10 select-none">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 lg:hidden">
          <span className="text-xl font-black text-white">D</span>
        </div>
        <span className="text-2xl font-black text-slate-900 dark:text-slate-50 tracking-tighter hidden lg:block bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          Dialogue
        </span>
      </div>
      
      {/* Navigation section */}
      <nav className="flex-1 px-3 space-y-2 overflow-y-auto no-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `
              relative flex items-center justify-center lg:justify-start lg:space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300
              ${isActive 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-[0_8px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.3)]' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-white/60 dark:hover:bg-slate-900/60'}
            `}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 w-1 y-1/2 -translate-y-1/2 h-6 bg-indigo-600 rounded-full lg:hidden" />
                )}
                <Icon name={item.icon} fill={isActive} className={`text-[24px] ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
                <span className={`hidden lg:inline text-sm ${isActive ? 'font-black' : 'font-medium'} tracking-tight`}>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* Notification Bell */}
        <div className="relative pt-2 border-t border-slate-200/50 dark:border-slate-800/50 mt-2">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className={`
              w-full flex items-center justify-center lg:justify-start lg:space-x-4 px-4 py-3.5 rounded-2xl transition-all duration-300
              ${showNotifications 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 shadow-[0_8px_20px_rgba(0,0,0,0.06)]' 
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-white/60 dark:hover:bg-slate-900/60'}
            `}
          >
            <div className="relative">
              <Icon name="notifications" fill={showNotifications} className="text-[24px]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white font-bold ring-2 ring-slate-100 dark:ring-slate-950">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-sm font-medium tracking-tight">Notifications</span>
          </button>

          {showNotifications && (
            <NotificationDropdown onClose={() => setShowNotifications(false)} />
          )}
        </div>
      </nav>

      {/* Footer / Profile Section */}
      <div className="px-3 lg:px-4 mt-auto pb-10">
        <button 
          onClick={handleLogout}
          className="group w-full aspect-square lg:aspect-auto flex items-center justify-center lg:justify-start lg:space-x-3 p-3 lg:p-2.5 rounded-full lg:rounded-2xl bg-white dark:bg-slate-900 shadow-lg lg:shadow-sm border border-slate-200/50 dark:border-slate-800/50 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-500/40 hover:ring-8 hover:ring-red-500/5 transition-all duration-500"
          title="Logout"
        >
          <div className="relative flex-shrink-0 group/avatar">
            {/* Logic render Avatar duy nhất được căn giữa tuyệt đối */}
            <div className="block lg:hidden transform group-hover:scale-90 group-hover:blur-[1px] transition-all duration-500">
              <Avatar alt={user?.name} size="sm" className="scale-100" />
            </div>
            <div className="hidden lg:block group-hover:scale-105 transition-transform duration-500">
              <Avatar alt={user?.name} size="md" className="shadow-sm" />
            </div>
            
            {/* Minimal Logout Overlay: Glassmorphism + Red Tint */}
            <div className="absolute inset-0 flex items-center justify-center bg-red-600/60 backdrop-blur-[3px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 lg:hidden z-10 scale-75 group-hover:scale-100">
              <Icon name="logout" className="text-white text-[16px] drop-shadow-lg" />
            </div>
          </div>

          <div className="hidden lg:block flex-1 text-left overflow-hidden">
            <p className="text-[12px] font-black text-slate-900 dark:text-slate-100 truncate group-hover:text-red-600 transition-colors uppercase tracking-tight">
              {user?.name || 'Guest User'}
            </p>
          </div>

          {/* Icon Logout của Desktop - Hiệu ứng Glow & Translate */}
          <div className="hidden lg:flex items-center ml-auto">
            <Icon 
              name="logout" 
              className="opacity-20 group-hover:opacity-100 group-hover:text-red-600 group-hover:translate-x-1 transition-all duration-500 scale-75 lg:scale-90" 
            />
          </div>
        </button>
      </div>
    </aside>
  );
};

export default SideNavBar;

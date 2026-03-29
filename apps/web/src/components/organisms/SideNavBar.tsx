import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';
import { useAuth } from '../../context/AuthContext';

const SideNavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // In a real app, you might want to call the API to invalidate the refresh token
      // For now, we just clear the local state
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
      <div className="text-2xl font-black text-slate-900 dark:text-slate-50 px-6 mb-8 tracking-tighter select-none">
        Dialogue
      </div>
      
      <nav className="flex-1 px-3 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ease-in-out
              ${isActive 
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-600 shadow-sm font-bold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 font-medium'}
            `}
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} fill={isActive} className="text-[24px]" />
                <span className="hidden lg:inline text-sm">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 mt-auto">
        <div 
          onClick={handleLogout}
          className="flex items-center lg:space-x-4 p-3 rounded-2xl bg-surface-container-high/50 hover:bg-error/10 group transition-all cursor-pointer"
          title="Logout"
        >
          <Avatar 
            alt={user?.name}
            size="md" 
          />
          <div className="hidden lg:block overflow-hidden">
            <p className="text-xs font-black text-on-surface truncate group-hover:text-error transition-colors">{user?.name || 'Guest User'}</p>
            <p className="text-[10px] text-on-surface-variant truncate font-bold opacity-60 group-hover:text-error/60">Tap to logout</p>
          </div>
          <Icon name="logout" className="hidden lg:block ml-auto opacity-0 group-hover:opacity-100 text-error transition-all scale-75 group-hover:scale-100" />
        </div>
      </div>
    </aside>
  );
};

export default SideNavBar;

import React from 'react';
import { NavLink } from 'react-router-dom';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';

const SideNavBar: React.FC = () => {
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
        <div className="flex items-center lg:space-x-4 p-3 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-high transition-colors cursor-pointer group">
          <Avatar 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTuDwS87RZMR8IvbG2dM-pVvMoEgyZRnAZZImxy3tSyvuK3PvVOyhj6O-_dpqVU_pyVymcNqaWgzLwqK7-WXR6uxdinNvxwyNswhaPQnecm3YYkrLfkU6EIc5IsPTleu8Fo3l-x5KfMeBIqIUjUO8c10Ztb-GrBsq46XLuvmIYYJzLOEyWKxtuapLC0vxHXL7OgwwQZjuObwpYaSnUh8w_IT8_HaBGNtNZlnaF96c6pPP5lcA_miWtwszFlUaXzvyBpQapdDvCDg"
            size="md" 
          />
          <div className="hidden lg:block overflow-hidden">
            <p className="text-xs font-black text-on-surface truncate group-hover:text-primary transition-colors">Alex Mercer</p>
            <p className="text-[10px] text-on-surface-variant truncate font-bold opacity-60">Premium Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideNavBar;

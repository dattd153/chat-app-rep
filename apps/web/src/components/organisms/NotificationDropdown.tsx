import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import Icon from '../atoms/Icon';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="absolute left-full ml-2 top-0 w-80 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-outline-variant/10 z-[100] overflow-hidden animate-in fade-in slide-in-from-left-2 duration-200">
      <header className="p-4 border-b border-outline-variant/10 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <h3 className="text-sm font-black text-on-surface">Notifications</h3>
        <button 
          onClick={markAllAsRead}
          className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          Mark all as read
        </button>
      </header>

      <div className="max-h-96 overflow-y-auto no-scrollbar">
        {notifications.length === 0 ? (
          <div className="p-8 text-center opacity-40">
            <Icon name="notifications_none" className="text-4xl mb-2" />
            <p className="text-xs font-bold">No notifications</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`
                p-4 border-b border-outline-variant/5 cursor-pointer transition-colors
                ${n.isRead ? 'opacity-60' : 'bg-indigo-50/30 dark:bg-indigo-900/10 border-l-4 border-indigo-600'}
                hover:bg-slate-50 dark:hover:bg-slate-800
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  p-2 rounded-full 
                  ${n.type === 'message' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}
                `}>
                  <Icon name={n.type === 'message' ? 'chat' : 'person_add'} className="text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-on-surface line-clamp-2">{n.content}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1 font-medium italic">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 bg-indigo-600 rounded-full mt-1 shrink-0"></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="p-2 bg-slate-50 dark:bg-slate-800/50 border-t border-outline-variant/10 text-center">
        <button 
          onClick={onClose}
          className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-on-surface transition-colors"
        >
          Close
        </button>
      </footer>
    </div>
  );
};

export default NotificationDropdown;

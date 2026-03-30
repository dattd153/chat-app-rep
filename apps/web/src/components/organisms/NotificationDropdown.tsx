import React from 'react';
import { useNotifications } from '../../context/NotificationContext';
import Icon from '../atoms/Icon';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="fixed bottom-24 left-20 lg:left-64 ml-4 w-[calc(100vw-6rem)] md:w-84 lg:w-[26rem] bg-slate-950/90 backdrop-blur-3xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] rounded-[2.5rem] border border-white/10 z-[1000] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-left-4 duration-700 ease-out">
      <header className="py-7 px-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Icon name="notifications" className="text-xl text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] leading-none mb-1">Thông báo</h3>
            <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">Của Dialogue</span>
          </div>
        </div>
        <button
          onClick={markAllAsRead}
          className="px-4 py-2 rounded-full text-[9px] font-black text-indigo-400 hover:text-white hover:bg-indigo-500/20 uppercase tracking-widest transition-all active:scale-95 border border-indigo-500/10"
        >
          Đọc tất cả
        </button>
      </header>

      <div className="max-h-[30rem] overflow-y-auto px-5 py-6 space-y-4 custom-scrollbar">
        {notifications.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-24 h-24 bg-white/[0.02] border border-white/[0.05] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 transform rotate-6 hover:rotate-12 transition-transform duration-700">
              <Icon name="done_all" className="text-4xl text-white/10" />
            </div>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em]">Sạch bong thông báo</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && markAsRead(n._id)}
              className={`
                group p-5 rounded-[2rem] cursor-pointer transition-all duration-300 relative overflow-hidden border
                ${n.isRead 
                  ? 'bg-transparent border-white/[0.03] opacity-40 hover:opacity-100 hover:bg-white/[0.02]' 
                  : 'bg-white/[0.05] border-white/10 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/5'}
              `}
            >
              {!n.isRead && (
                <div className="absolute top-0 left-0 w-1 y-2 my-auto h-12 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(129,140,248,0.8)]" />
              )}
              
              <div className="flex items-start space-x-5">
                <div className={`
                  shrink-0 w-13 h-13 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105 duration-500
                  ${n.type === 'message' 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' 
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}
                `}>
                  <Icon name={n.type === 'message' ? 'forum' : 'person_add'} className="text-2xl" />
                </div>
                
                <div className="flex-1 min-w-0 pt-1">
                  <p className={`text-xs ${n.isRead ? 'font-bold text-white/50' : 'font-black text-white'} leading-relaxed line-clamp-2 uppercase tracking-wide`}>
                    {n.content}
                  </p>
                  <div className="flex items-center space-x-3 mt-3">
                    <div className="flex items-center space-x-1.5 px-2 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                      <Icon name="history" className="text-[11px] text-white/20" />
                      <p className="text-[9px] font-black text-white/30 uppercase tracking-tighter">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest animate-pulse">Mới</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <footer className="p-6 bg-white/[0.02] border-t border-white/5">
        <button
          onClick={onClose}
          className="w-full py-4 rounded-[1.5rem] bg-white text-slate-950 text-[11px] font-black uppercase tracking-[0.3em] shadow-[0_20px_40px_-5px_rgba(255,255,255,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
        >
          Đã hiểu
        </button>
      </footer>
    </div>
  );
};

export default NotificationDropdown;

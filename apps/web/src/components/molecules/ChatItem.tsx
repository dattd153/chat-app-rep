import React from 'react';
import Avatar from '../atoms/Avatar';
import Badge from '../atoms/Badge';

interface ChatItemProps {
  name: string;
  avatarSrc: string;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  isActive?: boolean;
  status?: 'online' | 'offline';
  className?: string;
  onClick?: () => void;
}

const ChatItem: React.FC<ChatItemProps> = ({
  name,
  avatarSrc,
  lastMessage,
  time,
  unreadCount,
  isActive = false,
  status = 'offline',
  className = '',
  onClick
}) => {
  return (
    <div 
      onClick={onClick}
      className={`group relative flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
        isActive 
          ? 'bg-surface-container-lowest shadow-sm border-l-4 border-primary ring-1 ring-black/5' 
          : 'hover:bg-surface-container-high transition-all'
      } ${className}`}
    >
      {/* Avatar Container */}
      <div className="relative">
        <Avatar 
          src={avatarSrc} 
          size="md" 
          status="none" 
        />
        {status === 'online' && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-surface-container-low rounded-full"></div>
        )}
        {status === 'offline' && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-surface-dim border-2 border-surface-container-low rounded-full"></div>
        )}
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className="text-sm font-bold text-on-surface truncate">
            {name}
          </h4>
          <span className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">
            {time}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <p className={`text-xs ${isActive && unreadCount ? 'text-primary font-semibold' : 'text-on-surface-variant'} truncate`}>
            {lastMessage}
          </p>
          
          {unreadCount ? (
            <div className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default ChatItem;

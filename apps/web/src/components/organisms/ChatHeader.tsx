import React from 'react';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';

interface ChatHeaderProps {
  name: string;
  avatarSrc: string;
  statusText: string;
  isOnline?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatarSrc,
  statusText,
  isOnline = false
}) => {
  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-transparent shadow-sm z-10 bg-surface-container-lowest">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Avatar src={avatarSrc} size="md" />
          {isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div>
          <h2 className="text-lg font-bold leading-none text-on-surface">{name}</h2>
          <p className={`text-xs font-medium mt-1 flex items-center ${isOnline ? 'text-green-600' : 'text-on-surface-variant'}`}>
            {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>}
            {statusText}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant group">
          <Icon name="videocam" className="text-[24px] group-hover:text-primary" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant group">
          <Icon name="call" className="text-[24px] group-hover:text-primary" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant group">
          <Icon name="more_vert" className="text-[24px] group-hover:text-primary" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;

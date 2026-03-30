import React from 'react';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';

interface MessageBubbleProps {
  content: string;
  time: string;
  direction: 'inbound' | 'outbound';
  avatarSrc?: string;
  status?: 'sent' | 'delivered' | 'seen';
  className?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  time,
  direction,
  avatarSrc,
  status = 'sent',
  className = ''
}) => {
  const isInbound = direction === 'inbound';

  return (
    <div className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'} space-y-1 ${className} ${isInbound ? 'max-w-[70%]' : 'ml-auto max-w-[70%]'}`}>
      <div className={`flex items-end ${isInbound ? 'space-x-3' : 'space-x-reverse'}`}>
        {isInbound && avatarSrc && (
          <Avatar src={avatarSrc} size="sm" />
        )}
        
        <div 
          className={`
            p-4 text-sm leading-relaxed shadow-sm
            ${isInbound 
              ? 'bg-surface-container-high text-on-surface rounded-2xl rounded-bl-none' 
              : 'bg-primary-container text-white rounded-2xl rounded-br-none shadow-md'}
          `}
        >
          {content}
        </div>
      </div>

      <div className={`flex items-center space-x-1 mt-1 ${isInbound ? 'ml-11' : ''}`}>
        <span className="text-[10px] text-on-surface-variant font-medium">
          {time}
        </span>
        {!isInbound && (
          <Icon 
            name={status === 'seen' ? 'done_all' : 'done'} 
            className={`text-sm ${status === 'seen' ? 'text-indigo-500' : 'text-on-surface-variant'} font-bold`}
          />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;

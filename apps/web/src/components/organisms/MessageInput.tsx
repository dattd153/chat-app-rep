import React, { useState, useEffect } from 'react';
import Icon from '../atoms/Icon';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping?: (isTyping: boolean) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  // Typing indicator logic
  useEffect(() => {
    if (!onTyping) return;

    if (message.trim()) {
      if (!isTyping) {
        onTyping(true);
        setIsTyping(true);
      }

      const timeout = setTimeout(() => {
        onTyping(false);
        setIsTyping(false);
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      if (isTyping) {
        onTyping(false);
        setIsTyping(false);
      }
    }
  }, [message, onTyping, isTyping]);

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      if (onTyping) onTyping(false);
    }
  };

  return (
    <div className="flex items-center space-x-4 bg-surface-container-highest rounded-[24px] p-2 pl-4 border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-lg transition-all duration-300">
      <button className="text-on-surface-variant hover:text-primary transition-colors">
        <Icon name="mood" className="text-[20px]" />
      </button>
      <button className="text-on-surface-variant hover:text-primary transition-colors">
        <Icon name="attach_file" className="text-[20px]" />
      </button>
      
      <input 
        type="text" 
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        placeholder="Type a message..." 
        className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-sm py-2 placeholder:text-on-surface-variant/60"
      />

      <div className="flex items-center space-x-1">
        <button className="w-10 h-10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors">
          <Icon name="mic" className="text-[20px]" />
        </button>
        <button 
          onClick={handleSend}
          className="w-10 h-10 bg-primary-container text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        >
          <Icon name="send" fill className="text-[20px]" />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatHeader from '../components/organisms/ChatHeader';
import MessageInput from '../components/organisms/MessageInput';
import ChatItem from '../components/molecules/ChatItem';
import MessageBubble from '../components/molecules/MessageBubble';
import Icon from '../components/atoms/Icon';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { chatService, Chat } from '../services/chat.service';
import { messageService, Message } from '../services/message.service';
import { userService, UserProfile } from '../services/user.service';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useNotifications();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  // ... state
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatService.getChats();
      setChats(data);
    } catch (err) {
      console.error('Failed to fetch chats', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // WebSocket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload: any) => {
      console.log('Real-time message received:', payload);
      
      // 1. If message belongs to active chat, append it
      if (payload.chatId === activeChatId) {
        setMessages((prev: Message[]) => {
          // Avoid duplicates (e.g. if we just sent it and also received the socket event)
          if (prev.find((m: Message) => m._id === payload.id)) return prev;
          return [...prev, {
            _id: payload.id,
            chatId: payload.chatId,
            senderId: payload.senderId,
            content: payload.content,
            createdAt: payload.createdAt,
            status: payload.status
          } as Message];
        });
      }

      // 2. Always refresh conversations to update Last Message in the sidebar
      fetchConversations();
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [socket, activeChatId, fetchConversations]);

  // Fetch messages and other user details when activeChatId changes
  useEffect(() => {
    const loadChatDetails = async () => {
      if (!activeChatId || !user || !socket) return;

      try {
        // Join the chat room via socket
        socket.emit('join-chat', activeChatId);

        // Find the active chat object
        const chat = chats.find(c => c._id === activeChatId);
        if (chat) {
          // Identify the "other" participant
          const otherId = chat.participants.find(id => id !== user.id);
          if (otherId) {
            const profile = await userService.getUser(otherId);
            setOtherUser(profile);
          }
        }

        // Fetch messages
        const msgs = await messageService.getMessages(activeChatId);
        setMessages(msgs);
      } catch (err) {
        console.error('Failed to load chat details', err);
      }
    };

    loadChatDetails();

    return () => {
      if (activeChatId && socket) {
        socket.emit('leave-chat', activeChatId);
      }
    };
  }, [activeChatId, user, chats, socket]);

  const handleSendMessage = async (content: string) => {
    if (!activeChatId || !user) return;
    try {
      const newMsg = await messageService.sendMessage(activeChatId, content);
      setMessages((prev: Message[]) => [...prev, newMsg]);
      // Update the last message in the chat list locally
      setChats((prev: Chat[]) => prev.map(c => 
        c._id === activeChatId 
          ? { ...c, lastMessage: { content, senderId: user.id, createdAt: new Date().toISOString() }, updatedAt: new Date().toISOString() }
          : c
      ));
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-1 md:ml-20 lg:ml-64 bg-surface h-screen overflow-hidden animate-fade-in">
      {/* Middle Panel: Conversation List */}
      <section className="w-full md:w-80 lg:w-96 flex flex-col bg-surface-container-low border-r border-transparent shadow-sm z-10">
        <header className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tight text-on-surface">Messages</h1>
            <button 
              onClick={() => navigate('/contacts?tab=search')}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-white shadow-lg active:scale-95 transition-transform hover:opacity-90"
            >
              <Icon name="add" className="text-[24px]" />
            </button>
          </div>
          
          <div className="relative group">
            <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="w-full bg-surface-container-high border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/60 outline-none"
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 no-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 space-y-4 opacity-40">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs font-black uppercase tracking-widest">Loading Chats...</p>
            </div>
          ) : chats.length === 0 ? (
            <div className="p-10 text-center opacity-40">
              <Icon name="chat_bubble_outline" className="text-5xl mb-4" />
              <p className="text-sm font-bold">No conversations yet.</p>
            </div>
          ) : (
            chats.map(chat => (
              <ChatItem 
                key={chat._id}
                name={chat.name || "Conversation"} 
                lastMessage={chat.lastMessage?.content || "No messages yet"}
                time={formatTime(chat.updatedAt)}
                unreadCount={0}
                status="online"
                isActive={activeChatId === chat._id}
                avatarSrc="" 
                onClick={() => setActiveChatId(chat._id)}
              />
            ))
          )}
        </div>
      </section>

      {/* Right Panel: Chat Detail Area */}
      <section className="hidden md:flex flex-1 flex-col bg-surface-container-lowest overflow-hidden relative">
        {activeChatId ? (
          <>
            <ChatHeader 
              name={otherUser?.name || "Chatting..."}
              avatarSrc={otherUser?.avatar || ""}
              statusText={otherUser?.status || (otherUser ? "Connected" : "...")}
              isOnline={true}
            />

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-[radial-gradient(#e2dfff_1px,transparent_1px)] [background-size:24px_24px]">
              <div className="flex justify-center mb-4">
                <span className="px-4 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
                  Conversation Started
                </span>
              </div>

              {messages.map(msg => (
                <MessageBubble 
                  key={msg._id}
                  content={msg.content}
                  time={formatTime(msg.createdAt)}
                  direction={msg.senderId === user?.id ? 'outbound' : 'inbound'}
                  avatarSrc={msg.senderId === user?.id ? "" : (otherUser?.avatar || "")}
                  status={msg.status}
                  className="animate-fade-in"
                />
              ))}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10">
              <MessageInput onSendMessage={handleSendMessage} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <Icon name="forum" className="text-[120px] mb-6" />
            <h2 className="text-3xl font-black">Select a Conversation</h2>
            <p className="mt-2 font-bold">Choose a colleague to start chatting</p>
          </div>
        )}
      </section>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

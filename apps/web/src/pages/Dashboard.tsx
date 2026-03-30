import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import { SocketEvents, MessageStatus } from '@chat-app/shared';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [participantProfiles, setParticipantProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  
  // Real-time states
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({}); // chatId -> array of userIds
  const [presence, setPresence] = useState<Record<string, 'online' | 'offline'>>({});

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const data = await chatService.getChats();
      setChats(data);
      // Join all chat rooms to receive real-time updates for any conversation
      if (socket) {
        data.forEach(chat => {
          socket.emit(SocketEvents.JOIN_CHAT, chat.id);
        });
      }
    } catch (err) {
      console.error('Failed to fetch chats', err);
    } finally {
      setLoading(false);
    }
  }, [socket]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Fetch profiles for all participants in the chat list
  useEffect(() => {
    const fetchProfiles = async () => {
      if (chats.length === 0 || !user) return;
      
      const uniqueOtherIds = new Set<string>();
      chats.forEach(chat => {
        chat.participants.forEach(pid => {
          if (pid !== user.id && !participantProfiles[pid]) {
            uniqueOtherIds.add(pid);
          }
        });
      });

      if (uniqueOtherIds.size === 0) return;

      const newProfiles: Record<string, UserProfile> = { ...participantProfiles };
      let updated = false;

      await Promise.all(Array.from(uniqueOtherIds).map(async (id) => {
        const profile = await userService.getUser(id);
        if (profile) {
          newProfiles[id] = profile;
          updated = true;
        }
      }));

      if (updated) {
        setParticipantProfiles(newProfiles);
      }
    };

    fetchProfiles();
  }, [chats, user]);

  // Handle auto-opening chat from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cId = params.get('chatId');
    if (cId) {
      setActiveChatId(cId);
      // Clean up the URL
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  // WebSocket Listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (payload: any) => {
      // Clear typing status for this user when they send a message
      setTypingUsers(prev => ({
        ...prev,
        [payload.chatId]: (prev[payload.chatId] || []).filter(id => id !== payload.senderId)
      }));

      if (payload.chatId === activeChatId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === payload.id)) return prev;
          return [...prev, { ...payload } as Message];
        });
        
        // Auto-emit seen if we are in this chat
        socket.emit(SocketEvents.MESSAGE_SEEN, { chatId: payload.chatId, messageId: payload.id });
      }

      setChats((prev) => {
        const existingChat = prev.find(c => c.id === payload.chatId);
        if (existingChat) {
          return prev.map(c => 
            c.id === payload.chatId 
              ? { 
                  ...c, 
                  lastMessage: { 
                    content: payload.content, 
                    senderId: payload.senderId, 
                    createdAt: payload.createdAt 
                  },
                  updatedAt: payload.createdAt
                }
              : c
          ).sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());
        } else {
          // If the chat doesn't exist in our list yet, fetch all conversations
          // This handles the case where someone sends us a first message
          fetchConversations();
          return prev;
        }
      });
    };

    const handleTypingStart = (data: { chatId: string, userId: string }) => {
      setTypingUsers(prev => {
        const current = prev[data.chatId] || [];
        if (current.includes(data.userId)) return prev;
        return { ...prev, [data.chatId]: [...current, data.userId] };
      });
    };

    const handleTypingStop = (data: { chatId: string, userId: string }) => {
      setTypingUsers(prev => ({
        ...prev,
        [data.chatId]: (prev[data.chatId] || []).filter(id => id !== data.userId)
      }));
    };

    const handleMessageSeen = (data: { messageId: string, chatId: string, userId: string }) => {
      if (data.chatId === activeChatId) {
        setMessages((prev: Message[]) => prev.map((m: Message) => 
          m.id === data.messageId ? { ...m, status: MessageStatus.SEEN as any } : m
        ));
      }
    };

    const handlePresence = (data: { userId: string, status?: string }, isOnline: boolean) => {
      const status = isOnline ? 'online' : 'offline';
      setPresence(prev => ({ ...prev, [data.userId]: status }));
      
      // Update otherUser if it's the one we're chatting with
      setOtherUser(prev => (prev && prev.id === data.userId ? { ...prev, status } : prev));
    };

    socket.on(SocketEvents.NEW_MESSAGE, handleNewMessage);
    socket.on(SocketEvents.TYPING_START, handleTypingStart);
    socket.on(SocketEvents.TYPING_STOP, handleTypingStop);
    socket.on(SocketEvents.MESSAGE_SEEN, handleMessageSeen);
    socket.on(SocketEvents.USER_ONLINE, (data: any) => handlePresence(data, true));
    socket.on(SocketEvents.USER_OFFLINE, (data: any) => handlePresence(data, false));

    return () => {
      socket.off(SocketEvents.NEW_MESSAGE, handleNewMessage);
      socket.off(SocketEvents.TYPING_START, handleTypingStart);
      socket.off(SocketEvents.TYPING_STOP, handleTypingStop);
      socket.off(SocketEvents.MESSAGE_SEEN, handleMessageSeen);
      socket.off(SocketEvents.USER_ONLINE);
      socket.off(SocketEvents.USER_OFFLINE);
    };
  }, [socket, activeChatId, fetchConversations]);

  // Mark all unread messages as seen when entering chat
  useEffect(() => {
    if (activeChatId && messages.length > 0 && socket && user) {
      const unread = messages.filter((m: Message) => m.senderId !== user.id && (m.status as string) !== (MessageStatus.SEEN as string));
      unread.forEach((m: Message) => {
        socket.emit(SocketEvents.MESSAGE_SEEN, { chatId: activeChatId, messageId: m.id });
      });
    }
  }, [activeChatId, messages, socket, user]);

  // Fetch messages and other user details when activeChatId changes
  useEffect(() => {
    const loadChatDetails = async () => {
      if (!activeChatId || !user) return;

      try {
        const chat = chats.find(c => c.id === activeChatId);
        if (chat) {
          const participants = await chatService.getChatMembers(activeChatId);
          const otherId = participants.find((id: string) => id !== user.id);
          if (otherId) {
            const profile = await userService.getUser(otherId);
            if (profile) {
              // Inject real-time presence
              const currentStatus = presence[otherId] || profile.status || 'offline';
              setOtherUser({ ...profile, status: currentStatus });
            }
          }
        }

        const msgs = await messageService.getMessages(activeChatId);
        setMessages([...msgs].reverse());

        // Update the chat list's lastMessage if it's missing (helps backfill old conversations)
        if (msgs.length > 0) {
          const lastMsg = msgs[0]; // Newest is first from API
          setChats(prev => prev.map(c => {
            if (c.id === activeChatId && (!c.lastMessage?.content)) {
              return {
                ...c,
                lastMessage: {
                  content: lastMsg.content,
                  senderId: lastMsg.senderId,
                  createdAt: lastMsg.createdAt
                },
                updatedAt: lastMsg.createdAt
              };
            }
            return c;
          }));
        }
      } catch (err) {
        console.error('Failed to load chat details', err);
      }
    };

    loadChatDetails();
  }, [activeChatId, user]);

  const handleSendMessage = async (content: string) => {
    if (!activeChatId || !user) return;
    try {
      const newMsg = await messageService.sendMessage(activeChatId, content);
      setMessages((prev) => [...prev, newMsg]);
      setChats((prev) => prev.map(c => 
        c.id === activeChatId 
          ? { ...c, lastMessage: { content, senderId: user.id, createdAt: new Date().toISOString() }, updatedAt: new Date().toISOString() }
          : c
      ));
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  const handleTypingCallback = (isTyping: boolean) => {
    if (!socket || !activeChatId) return;
    const event = isTyping ? SocketEvents.TYPING_START : SocketEvents.TYPING_STOP;
    socket.emit(event, activeChatId);
  };

  const activeTypingText = useMemo(() => {
    if (!activeChatId || !typingUsers[activeChatId]?.length) return null;
    return "is typing...";
  }, [activeChatId, typingUsers]);

  const formatTime = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeChatId) {
      // Small timeout to ensure DOM is updated
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, activeChatId]);

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
            chats.map(chat => {
              const otherParticipantId = chat.type === 'direct' 
                ? chat.participants?.find((id: string) => id !== user?.id)
                : null;
              
              const profile = otherParticipantId ? participantProfiles[otherParticipantId] : null;
              const displayName = chat.name || profile?.name || (otherParticipantId ? `User ${otherParticipantId.substring(0, 4)}` : "Conversation");
              
              return (
                <ChatItem 
                  key={chat.id}
                  name={displayName} 
                  lastMessage={typingUsers[chat.id]?.length ? "is typing..." : (chat.lastMessage?.content || "No messages yet")}
                  time={formatTime(chat.updatedAt)}
                  unreadCount={0}
                  status={presence[otherParticipantId || ''] || (participantProfiles[otherParticipantId || '']?.status) || 'offline'} 
                  isActive={activeChatId === chat.id}
                  avatarSrc={participantProfiles[otherParticipantId || '']?.avatar || ""} 
                  onClick={() => setActiveChatId(chat.id)}
                />
              );
            })
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
              statusText={activeTypingText || otherUser?.status || (otherUser ? "Connected" : "...")}
              isOnline={otherUser?.status === 'online'}
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
                  key={msg.id}
                  content={msg.content}
                  time={formatTime(msg.createdAt)}
                  direction={msg.senderId === user?.id ? 'outbound' : 'inbound'}
                  avatarSrc={msg.senderId === user?.id ? "" : (otherUser?.avatar || "")}
                  status={msg.status as any}
                  className="animate-fade-in"
                />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 bg-surface-container-lowest border-t border-outline-variant/10">
              <MessageInput 
                onSendMessage={handleSendMessage} 
                onTyping={handleTypingCallback}
              />
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

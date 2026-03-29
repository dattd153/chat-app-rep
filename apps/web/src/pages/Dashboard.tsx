import React, { useState } from 'react';
import ChatHeader from '../components/organisms/ChatHeader';
import MessageInput from '../components/organisms/MessageInput';
import ChatItem from '../components/molecules/ChatItem';
import MessageBubble from '../components/molecules/MessageBubble';
import Icon from '../components/atoms/Icon';

const Dashboard: React.FC = () => {
  const [activeChat, setActiveChat] = useState(0);

  const mockChats = [
    { 
      id: 0,
      name: 'Elena Vance', 
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD81e2XViaPGr6qPDRH4XsVPei8vr0LGymvlnVGDfbkJfq8PrIPqWU_k4WWR8ABqXLljWAcCbpWaMzliXsy6i0sjfuueIkBKlCf9RPNPwohiIrNDeucDJSdkywGeXbJRtYxFBJ8C34PyjeYj0PuHa4B-sO8qyw736nrJIMOyEJxY6k3janLHrZzDhfBHZFc8peJ3tVdNhA_UV26C1Z-AoC3RNbvKa670B70I94fc4j-QOk5xQaASuXj5MVRimUvZI2BOKbGnLyufQ',
      lastMessage: "I've attached the final campaign assets...",
      time: '12:45 PM',
      unread: 2,
      status: 'online' as const
    },
    { 
      id: 1,
      name: 'Marcus Wright', 
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAMdmTqMw8BKHA8IWI9WUGkX3g6lfUTLJ7miDnTaKypobDlLu7LdMPIk3MuiWBfH3S94PAEKF3c4lAJFpLK0TNC-lm0WAp5bU-a6_CxA6kriK0O8hFEcbqKwEFKF1i1oiC6OXIzMp5fYYkG8kEQtzqT3_HLnSOqDJpjqvisrR6rVZhDHbPZ10xd686BdBWScqlTu0I7m2_uGslTOGS19rP6zLjZWhKb9NuyCSeJFeghmEgQ4W07TvzbK3lttN6Z0fNdHCV-7bFh0g',
      lastMessage: "Let's sync up tomorrow about the new UI.",
      time: 'Yesterday',
      unread: 0,
      status: 'offline' as const
    },
    { 
        id: 2,
        name: 'Julian Casablancas', 
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC__KHBZKqx85ZlwNhoKIowGKGT8mj3DgPunQYx85VXngWOIGjWqIgjXYL30VmwBgiKlYa4_tcNJ3i5D9P-ymHEani6itcJgX8IVPGw7YFAlt5CpIMeRe8BIoDpdGXRHbiK66n5tfRKJXxauXYSV_8EL5bc88uhQyNMWCtqU8Y3vvv-TQ1u6c3PxIUv58wE-7bUuUKeqaWsJ77mtp5w_fPOEzKc8O2wjuAeqAQuvNYq9WfWfiwBTo7RdVyWgj_jgr9rEEDVSiK0zg',
        lastMessage: "Did you see the latest release notes?",
        time: 'Tuesday',
        unread: 0,
        status: 'offline' as const
      },
  ];

  const mockMessages = [
    {
      id: 1,
      content: "Hey Alex! Did you manage to review the brand guidelines for the Dialogue app? 🎨",
      time: "12:30 PM",
      direction: "inbound" as const,
      avatar: mockChats[0].avatar
    },
    {
      id: 2,
      content: "I've updated the color palette to include that premium Indigo we discussed.",
      time: "12:32 PM",
      direction: "inbound" as const,
      avatar: mockChats[0].avatar
    },
    {
      id: 3,
      content: "Just checking them now! The Indigo looks absolutely stunning. It really elevates the whole interface. ✨",
      time: "12:34 PM",
      direction: "outbound" as const,
      status: "read" as const
    },
    {
        id: 4,
        content: "I'm especially liking how the tonal layering works with the Surface-Container-Low backgrounds.",
        time: "12:35 PM",
        direction: "outbound" as const,
        status: "read" as const
      }
  ];

  return (
    <div className="flex flex-1 md:ml-20 lg:ml-64 bg-surface h-screen overflow-hidden animate-fade-in">
      {/* Middle Panel: Conversation List */}
      <section className="w-full md:w-80 lg:w-96 flex flex-col bg-surface-container-low border-r border-transparent">
        <header className="p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black tracking-tight text-on-surface">Messages</h1>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-primary-container text-white shadow-lg active:scale-95 transition-transform hover:opacity-90">
              <Icon name="edit" className="text-[20px]" />
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
          {mockChats.map(chat => (
            <ChatItem 
              key={chat.id}
              {...chat}
              isActive={activeChat === chat.id}
              avatarSrc={chat.avatar}
              unreadCount={chat.unread}
              onClick={() => setActiveChat(chat.id)}
            />
          ))}
        </div>
      </section>

      {/* Right Panel: Chat Detail Area */}
      <section className="hidden md:flex flex-1 flex-col bg-surface-container-lowest overflow-hidden relative">
        <ChatHeader 
          name={mockChats[activeChat].name}
          avatarSrc={mockChats[activeChat].avatar}
          statusText={mockChats[activeChat].status === 'online' ? 'Online Now' : 'Last seen Tuesday'}
          isOnline={mockChats[activeChat].status === 'online'}
        />

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-[radial-gradient(#e2dfff_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="flex justify-center mb-4">
            <span className="px-4 py-1 bg-surface-container-high text-on-surface-variant text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm">
              Today
            </span>
          </div>

          {mockMessages.map(msg => (
            <MessageBubble 
              key={msg.id}
              content={msg.content}
              time={msg.time}
              direction={msg.direction}
              avatarSrc={msg.avatar}
              status={msg.status}
              className="animate-fade-in"
            />
          ))}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-surface-container-lowest">
          <MessageInput onSendMessage={(content) => console.log('Sending:', content)} />
        </div>
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

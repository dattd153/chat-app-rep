import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { userService, UserProfile } from '../services/user.service';
import Avatar from '../components/atoms/Avatar';
import Icon from '../components/atoms/Icon';
import ContactSearch from '../components/molecules/ContactSearch';
import { useNotifications } from '../context/NotificationContext';
import { chatService } from '../services/chat.service';

const Contacts: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as 'all' | 'pending' | 'search') || 'all';

  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [pendingFriendRequests, setPendingFriendRequests] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'search'>(initialTab);
  const [loading, setLoading] = useState(true);
  const { notifications, markAsRead } = useNotifications();
  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [friendsData, pendingData] = await Promise.all([
        userService.getFriendList(),
        userService.getPendingRequests()
      ]);
      setFriends(friendsData);
      setPendingFriendRequests(pendingData);
    } catch (err) {
      console.error('Failed to fetch contact data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAccept = async (friendId: string, notificationId?: string) => {
    try {
      await userService.acceptFriendRequest(friendId);
      if (notificationId) await markAsRead(notificationId);
      
      // Auto-clear related notifications if any
      const relatedNotif = notifications.find(n => n.type === 'friend_request' && n.refId === friendId && !n.isRead);
      if (relatedNotif) await markAsRead(relatedNotif._id);
      
      fetchData();
    } catch (err) {
      console.error('Failed to accept friend request', err);
    }
  };

  const handleStartChat = async (friendId: string) => {
    try {
      const chat = await chatService.createChat([friendId]);
      const chatId = chat.id;
      if (chatId) {
        navigate(`/dashboard?chatId=${chatId}`);
      } else {
        console.error('Chat created but ID is missing', chat);
      }
    } catch (err) {
      console.error('Failed to create or navigate to chat', err);
    }
  };

  return (
    <div className="flex flex-1 md:ml-20 lg:ml-64 bg-surface h-screen overflow-hidden animate-fade-in">
      <section className="w-full flex flex-col bg-surface-container-low max-w-4xl shadow-sm p-8">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-on-surface">Contacts</h1>
            <p className="text-sm font-bold opacity-60 mt-2">Manage your relationships and find new people</p>
          </div>
          <div className="flex bg-surface-container-high rounded-full p-1.5 shadow-inner">
            {(['all', 'pending', 'search'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all
                  ${activeTab === tab
                    ? 'bg-primary text-white shadow-md'
                    : 'text-on-surface-variant hover:text-on-surface'}
                `}
              >
                {tab === 'pending' && pendingFriendRequests.length > 0 && (
                  <span className="w-2 h-2 bg-error rounded-full inline-block mr-2 animate-pulse"></span>
                )}
                {tab}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto pr-4 no-scrollbar">
          {activeTab === 'all' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-full py-20 flex justify-center opacity-40">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : friends.length === 0 ? (
                <div className="col-span-full py-20 text-center opacity-20">
                  <Icon name="group_off" className="text-[120px] mb-6" />
                  <h2 className="text-2xl font-black">No friends yet</h2>
                  <p className="mt-2 font-bold italic">Start growing your network!</p>
                </div>
              ) : (
                friends.map((friend) => (
                  <div key={friend.id} className="flex items-center space-x-4 p-5 bg-surface-container-lowest rounded-3xl border border-outline-variant/10 hover:shadow-lg transition-all border-l-8 border-l-primary group">
                    <div className="relative">
                      <Avatar src={friend.avatar} size="lg" />
                      {friend.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-4 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg font-black text-on-surface truncate">{friend.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-widest ${friend.online ? 'text-green-600' : 'text-on-surface-variant opacity-60'}`}>
                        {friend.online ? 'Online now' : 'Offline'}
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartChat(friend.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-2xl bg-surface-container-high hover:bg-primary hover:text-white transition-all"
                    >
                      <Icon name="chat" className="text-lg" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'pending' && (
            <div className="space-y-4">
              {loading ? (
                <div className="py-20 flex justify-center opacity-40">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : pendingFriendRequests.length === 0 ? (
                <div className="py-20 text-center opacity-20">
                  <Icon name="inbox" className="text-[120px] mb-6" />
                  <h2 className="text-2xl font-black">No pending requests</h2>
                </div>
              ) : (
                pendingFriendRequests.map((req: UserProfile) => (
                  <div key={req.id} className="flex items-center justify-between p-6 bg-surface-container-lowest rounded-3xl border border-warning/20 shadow-sm animate-fade-in hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-5">
                      <Avatar src={req.avatar} size="lg" />
                      <div>
                        <p className="text-sm font-black text-on-surface">{req.name}</p>
                        <p className="text-[10px] text-warning font-bold uppercase tracking-widest mt-1">
                          Sent you a friend request
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'search' && (
            <ContactSearch />
          )}
        </div>
      </section>
    </div>
  );
};

export default Contacts;

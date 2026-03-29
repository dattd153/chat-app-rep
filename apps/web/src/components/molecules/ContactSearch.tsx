import React, { useState } from 'react';
import { userService, UserProfile } from '../../services/user.service';
import Avatar from '../atoms/Avatar';
import Icon from '../atoms/Icon';

const ContactSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<string[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const users = await userService.searchUsers(query);
      setResults(users);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (userId: string) => {
    try {
      await userService.sendFriendRequest(userId);
      setSentRequests(prev => [...prev, userId]);
    } catch (err) {
      console.error('Failed to send friend request', err);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSearch} className="relative group">
        <Icon name="search" className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg group-focus-within:text-primary transition-colors" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people by name or email..." 
          className="w-full bg-surface-container-high border-none rounded-2xl py-4 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/60 outline-none shadow-sm"
        />
      </form>

      <div className="space-y-2">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : results.length > 0 ? (
          results.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all group">
              <div className="flex items-center space-x-4">
                <Avatar src={u.avatar} size="md" />
                <div>
                  <p className="text-sm font-black text-on-surface">{u.name}</p>
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider opacity-60">User ID: {u.id.substring(0, 8)}...</p>
                </div>
              </div>
              
              <button 
                onClick={() => handleAddFriend(u.id)}
                disabled={sentRequests.includes(u.id)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-black transition-all
                  ${sentRequests.includes(u.id)
                    ? 'bg-success/10 text-success cursor-default'
                    : 'bg-primary text-white shadow-md active:scale-95 hover:opacity-90'}
                `}
              >
                <Icon name={sentRequests.includes(u.id) ? 'done' : 'person_add'} className="text-sm" />
                <span>{sentRequests.includes(u.id) ? 'Sent' : 'Add'}</span>
              </button>
            </div>
          ))
        ) : query && (
          <p className="text-center py-8 text-xs font-bold text-on-surface-variant opacity-40 italic">No users found</p>
        )}
      </div>
    </div>
  );
};

export default ContactSearch;

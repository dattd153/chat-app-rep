import React from 'react';
import Avatar from '../components/atoms/Avatar';
import Button from '../components/atoms/Button';
import Icon from '../components/atoms/Icon';
import { useAuth } from '../context/AuthContext';

const Profile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 md:ml-20 lg:ml-64 bg-surface h-screen overflow-hidden animate-fade-in">
      <div className="flex-1 overflow-y-auto px-8 lg:px-12 py-10 custom-scrollbar">
        <div className="max-w-5xlpt-10 md:pt-4">

          {/* Hero Profile Section */}
          <section className="mb-16">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-10">
              {/* Avatar with Status */}
              <div className="relative group">
                <div className="w-40 h-40 md:w-52 md:h-52 rounded-full p-1.5 bg-gradient-to-tr from-primary to-indigo-300 shadow-xl shadow-primary/10">
                  <Avatar
                    alt={user?.name}
                    size="xl"
                    status="online"
                    className="w-full h-full"
                  />
                </div>
                <button className="absolute inset-4 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                  <Icon name="photo_camera" className="text-white text-3xl" />
                </button>
              </div>

              {/* Name & Bio */}
              <div className="flex-1 text-center md:text-left pb-4">
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                  <h1 className="text-5xl font-black tracking-tight text-on-surface leading-none">{user?.name || 'User Name'}</h1>
                  <Button variant="primary" className="px-8 font-black text-sm rounded-full">Edit Profile</Button>
                </div>
                <p className="text-on-surface-variant text-lg max-w-2xl leading-relaxed font-medium">
                  {user?.email} • Account Member
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-8 mt-8">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <Icon name="location_on" className="text-[20px]" />
                    <span className="text-sm font-bold opacity-80">Connected via Dialogue</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant hover:text-primary cursor-pointer transition-colors">
                    <Icon name="verified" className="text-[20px] text-primary" />
                    <span className="text-sm font-bold">Standard Account</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bento Grid Settings & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Main Preferences Card */}
            <div className="md:col-span-2 bg-surface-container-lowest p-10 rounded-[3rem] shadow-sm border border-outline-variant/10">
              <h2 className="text-2xl font-black mb-10 flex items-center gap-3">
                <Icon name="settings" className="text-[28px]" />
                Preferences
              </h2>
              <div className="space-y-8">
                {/* Dark Mode */}
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-primary/5 transition-colors">
                      <Icon name="dark_mode" className="text-[28px]" />
                    </div>
                    <div>
                      <p className="font-black text-lg">Dark mode</p>
                      <p className="text-sm text-on-surface-variant font-medium">Auto-adjust interface brightness</p>
                    </div>
                  </div>
                  <div className="w-14 h-8 bg-surface-container-highest rounded-full relative p-1 transition-colors">
                    <div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-0 transition-transform"></div>
                  </div>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary transition-colors group-hover:text-white">
                      <Icon name="notifications_active" className="text-[28px]" />
                    </div>
                    <div>
                      <p className="font-black text-lg">Push Notifications</p>
                      <p className="text-sm text-on-surface-variant font-medium">Real-time alerts for new messages</p>
                    </div>
                  </div>
                  <div className="w-14 h-8 bg-primary rounded-full relative p-1 transition-colors">
                    <div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-6 transition-transform"></div>
                  </div>
                </div>

                {/* Privacy */}
                <div className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:bg-indigo-50 transition-colors">
                      <Icon name="lock" className="text-[28px]" />
                    </div>
                    <div>
                      <p className="font-black text-lg">Read Receipts</p>
                      <p className="text-sm text-on-surface-variant font-medium">Show when you've seen messages</p>
                    </div>
                  </div>
                  <div className="w-14 h-8 bg-primary rounded-full relative p-1 transition-colors">
                    <div className="w-6 h-6 bg-white rounded-full shadow-md translate-x-6 transition-transform"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats & Security Section */}
            <div className="space-y-8">
              {/* Conversations Activity Card */}
              <div className="bg-primary text-on-primary p-10 rounded-[3rem] relative overflow-hidden shadow-2xl shadow-primary/20">
                <div className="relative z-10">
                  <p className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-3">Activity Status</p>
                  <h3 className="text-6xl font-black mb-4">0</h3>
                  <p className="text-white/80 text-sm font-bold flex items-center gap-2">
                    <Icon name="trending_up" className="text-lg" />
                    New member this month
                  </p>
                </div>
                <Icon name="bubble_chart" className="absolute -right-4 -bottom-4 text-[12rem] opacity-20 transform rotate-12 pointer-events-none" />
              </div>

              {/* Security Status Card */}
              <div className="bg-surface-container-lowest p-8 rounded-[2.5rem] border border-outline-variant/10 flex flex-col items-center text-center shadow-sm">
                <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6 border border-emerald-100">
                  <Icon name="verified_user" className="text-[32px]" />
                </div>
                <h4 className="font-black text-lg mb-2">Account Verified</h4>
                <p className="text-xs text-on-surface-variant font-medium px-4 leading-relaxed italic">Your account is secured with Dialogue encryption.</p>
                <Button variant="ghost" className="mt-6 text-primary font-black text-xs uppercase tracking-widest hover:bg-transparent hover:underline">Review Security</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

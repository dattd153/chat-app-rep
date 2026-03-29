import React from 'react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'none';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ 
  src, 
  alt = 'User', 
  size = 'md', 
  status = 'none', 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-32 h-32',
  };

  const statusSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
    xl: 'w-6 h-6 border-4',
  };

  // Premium initials avatar fallback using ui-avatars.com
  const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=6366f1&color=fff&bold=true&size=128`;

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={src || defaultAvatar}
        alt={alt}
        className={`${sizes[size]} rounded-full object-cover border-2 border-surface-container-lowest shadow-sm`}
        onError={(e) => {
          (e.target as HTMLImageElement).src = defaultAvatar;
        }}
      />
      {status !== 'none' && (
        <span 
          className={`absolute bottom-0 right-0 ${statusSizes[size]} ${status === 'online' ? 'bg-green-500' : 'bg-slate-400'} border-2 border-surface-container-low rounded-full`}
        ></span>
      )}
    </div>
  );
};

export default Avatar;

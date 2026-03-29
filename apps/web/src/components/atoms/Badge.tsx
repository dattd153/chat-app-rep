import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'error' | 'primary' | 'success' | 'surface';
  size?: 'sm' | 'md';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '' 
}) => {
  const variants = {
    error: 'bg-error text-on-error font-bold',
    primary: 'bg-primary/10 text-primary font-semibold',
    success: 'bg-green-100 text-green-700 font-semibold',
    surface: 'bg-surface-container-high text-on-surface-variant',
  };

  const sizes = {
    sm: 'px-1.5 py-0.5 text-[10px] rounded-full',
    md: 'px-3 py-1 text-xs rounded-lg',
  };

  return (
    <span className={`inline-flex items-center justify-center leading-none uppercase tracking-tight ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

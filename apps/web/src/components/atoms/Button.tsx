import React from 'react';
import Icon from './Icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon';
  icon?: string;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  icon, 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'px-6 py-2.5 font-medium transition-all transform active:scale-95 flex items-center justify-center gap-2';
  
  const variants = {
    primary: 'bg-primary-container text-on-primary rounded-xl ambient-shadow hover:brightness-110',
    secondary: 'bg-surface-container-lowest border border-outline-variant/50 text-on-surface rounded-xl hover:bg-surface-container',
    ghost: 'bg-transparent text-primary hover:bg-primary/5 rounded-xl',
    icon: 'p-0 w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors',
  };

  const finalClassName = `${variant !== 'icon' ? baseStyles : 'flex items-center justify-center transform active:scale-90 transition-all'} ${variants[variant]} ${className}`;

  return (
    <button className={finalClassName} {...props}>
      {icon && <Icon name={icon} className={variant === 'icon' ? 'text-[24px]' : 'text-[18px]'} />}
      {variant !== 'icon' && children}
    </button>
  );
};

export default Button;

import { ReactNode } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RemoteButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'circle' | 'pill';
  active?: boolean;
}

export function RemoteButton({ children, className, variant = 'secondary', active, onClick, ...props }: RemoteButtonProps) {
  
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    if (onClick) onClick(e);
  };

  const baseStyles = "relative flex items-center justify-center transition-all duration-150 active:scale-95 overflow-hidden select-none touch-manipulation";
  
  const variants = {
    primary: "bg-primary text-white rounded-xl shadow-[0_4px_14px_0_rgba(229,9,20,0.39)] hover:bg-red-600 font-semibold py-3 px-6",
    secondary: "bg-surface/80 border border-white/10 text-textMain rounded-xl shadow-sm hover:bg-surface/100 hover:border-white/20 backdrop-blur-sm",
    danger: "bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20",
    circle: "bg-surface/80 border border-white/10 text-textMain rounded-full shadow-sm hover:bg-surface/100 hover:border-white/20 w-14 h-14 backdrop-blur-sm",
    pill: "bg-surface/80 border border-white/10 text-textMain rounded-full shadow-sm hover:bg-surface/100 hover:border-white/20 py-2 px-6 backdrop-blur-sm",
  };

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        active && "bg-white text-black border-white",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
}

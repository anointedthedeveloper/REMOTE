import { useRef, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

export function MousePad() {
  const { socket } = useSocket();
  const padRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault(); // Prevent scrolling while using touchpad
      const touch = e.touches[0];
      lastPos.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!lastPos.current) return;
      
      const touch = e.touches[0];
      const dx = touch.clientX - lastPos.current.x;
      const dy = touch.clientY - lastPos.current.y;
      
      // LG WebOS typically uses values around 1-30 for dx/dy
      // A small multiplier helps with speed
      const sensitivity = 1.5;
      
      socket?.emit('tv:mouseMove', { 
        dx: Math.round(dx * sensitivity), 
        dy: Math.round(dy * sensitivity) 
      });
      
      lastPos.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      lastPos.current = null;
    };

    const handleClick = () => {
      if (navigator.vibrate) navigator.vibrate(20);
      socket?.emit('tv:mouseClick');
    };

    pad.addEventListener('touchstart', handleTouchStart, { passive: false });
    pad.addEventListener('touchmove', handleTouchMove, { passive: false });
    pad.addEventListener('touchend', handleTouchEnd, { passive: false });
    pad.addEventListener('click', handleClick);

    return () => {
      pad.removeEventListener('touchstart', handleTouchStart);
      pad.removeEventListener('touchmove', handleTouchMove);
      pad.removeEventListener('touchend', handleTouchEnd);
      pad.removeEventListener('click', handleClick);
    };
  }, [socket]);

  return (
    <div className="w-full flex flex-col items-center">
      <div 
        ref={padRef}
        className="w-full max-w-sm h-64 bg-surface border border-white/10 rounded-2xl shadow-inner touch-none relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50 pointer-events-none" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-white/20 font-medium tracking-widest text-sm uppercase">Touchpad</span>
        </div>
      </div>
      <p className="text-xs text-textMuted mt-3 text-center">Swipe to move, tap to click</p>
    </div>
  );
}

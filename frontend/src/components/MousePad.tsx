import { useRef, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';

export function MousePad() {
  const { socket } = useSocket();
  const padRef = useRef<HTMLDivElement>(null);
  const lastPos = useRef<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const pad = padRef.current;
    if (!pad) return;

    const handleStart = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      lastPos.current = { x: clientX, y: clientY };
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!lastPos.current) return;
      
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const dx = clientX - lastPos.current.x;
      const dy = clientY - lastPos.current.y;
      
      const sensitivity = 1.5;
      
      socket?.emit('tv:mouseMove', { 
        dx: Math.round(dx * sensitivity), 
        dy: Math.round(dy * sensitivity) 
      });
      
      lastPos.current = { x: clientX, y: clientY };
    };

    const handleEnd = (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      lastPos.current = null;
    };

    const handleClick = () => {
      if (navigator.vibrate) navigator.vibrate(20);
      socket?.emit('tv:mouseClick');
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Scroll commands to TV
      const sensitivity = 0.5;
      socket?.emit('tv:mouseScroll', {
        dx: Math.round(-e.deltaX * sensitivity),
        dy: Math.round(-e.deltaY * sensitivity)
      });
    };

    pad.addEventListener('touchstart', handleStart as any, { passive: false });
    pad.addEventListener('touchmove', handleMove as any, { passive: false });
    pad.addEventListener('touchend', handleEnd as any, { passive: false });
    
    pad.addEventListener('mousedown', handleStart as any, { passive: false });
    pad.addEventListener('mousemove', (e) => {
      if (e.buttons === 1) handleMove(e);
    }, { passive: false });
    pad.addEventListener('mouseup', handleEnd as any, { passive: false });
    pad.addEventListener('mouseleave', handleEnd as any, { passive: false });
    
    pad.addEventListener('wheel', handleWheel, { passive: false });
    pad.addEventListener('click', handleClick);

    return () => {
      pad.removeEventListener('touchstart', handleStart as any);
      pad.removeEventListener('touchmove', handleMove as any);
      pad.removeEventListener('touchend', handleEnd as any);
      pad.removeEventListener('mousedown', handleStart as any);
      pad.removeEventListener('mouseup', handleEnd as any);
      pad.removeEventListener('mouseleave', handleEnd as any);
      pad.removeEventListener('wheel', handleWheel);
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

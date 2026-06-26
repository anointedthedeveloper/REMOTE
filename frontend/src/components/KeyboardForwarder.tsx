import { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Keyboard } from 'lucide-react';

export function KeyboardForwarder() {
  const { socket } = useSocket();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!active || !socket) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in a native input box on the phone/PC
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      e.preventDefault();

      if (navigator.vibrate) navigator.vibrate(10);

      switch (e.key) {
        case 'Enter':
          socket.emit('tv:enterKey');
          break;
        case 'Backspace':
          socket.emit('tv:button', 'BACK');
          break;
        case 'ArrowUp':
          socket.emit('tv:button', 'UP');
          break;
        case 'ArrowDown':
          socket.emit('tv:button', 'DOWN');
          break;
        case 'ArrowLeft':
          socket.emit('tv:button', 'LEFT');
          break;
        case 'ArrowRight':
          socket.emit('tv:button', 'RIGHT');
          break;
        case 'Escape':
          socket.emit('tv:button', 'HOME');
          break;
        default:
          if (e.key.length === 1) { // Normal character
            socket.emit('tv:keyboardInput', e.key);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [active, socket]);

  return (
    <button
      onClick={() => {
        setActive(!active);
        if (navigator.vibrate) navigator.vibrate(20);
      }}
      className={`flex items-center gap-2 p-3 rounded-xl transition-all border ${
        active 
          ? 'bg-primary text-white border-primary shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.5)]' 
          : 'bg-surface/50 border-white/10 text-textMuted hover:bg-white/10'
      }`}
      title="Toggle PC Keyboard Forwarding"
    >
      <Keyboard size={20} />
      <span className="text-sm font-medium">{active ? 'PC Keyboard: ON' : 'PC Keyboard: OFF'}</span>
    </button>
  );
}

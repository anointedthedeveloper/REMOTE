import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, CircleDot } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';

export function DPad() {
  const { socket } = useSocket();

  const handleButton = (btn: string) => {
    if (navigator.vibrate) navigator.vibrate(50);
    socket?.emit('tv:button', btn);
  };

  const handleOK = () => {
    if (navigator.vibrate) navigator.vibrate(50);
    socket?.emit('tv:button', 'ENTER');
  };

  return (
    <div className="relative w-64 h-64 mx-auto rounded-full bg-surface/50 border border-white/5 backdrop-blur-md shadow-inner flex items-center justify-center p-2">
      {/* Up */}
      <button 
        onClick={() => handleButton('UP')}
        className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-16 flex items-start justify-center pt-2 rounded-t-full hover:bg-white/10 active:bg-white/20 transition-colors"
      >
        <ChevronUp size={32} className="text-white/70" />
      </button>
      
      {/* Down */}
      <button 
        onClick={() => handleButton('DOWN')}
        className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-16 flex items-end justify-center pb-2 rounded-b-full hover:bg-white/10 active:bg-white/20 transition-colors"
      >
        <ChevronDown size={32} className="text-white/70" />
      </button>
      
      {/* Left */}
      <button 
        onClick={() => handleButton('LEFT')}
        className="absolute left-2 top-1/2 -translate-y-1/2 w-16 h-20 flex items-center justify-start pl-2 rounded-l-full hover:bg-white/10 active:bg-white/20 transition-colors"
      >
        <ChevronLeft size={32} className="text-white/70" />
      </button>
      
      {/* Right */}
      <button 
        onClick={() => handleButton('RIGHT')}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-16 h-20 flex items-center justify-end pr-2 rounded-r-full hover:bg-white/10 active:bg-white/20 transition-colors"
      >
        <ChevronRight size={32} className="text-white/70" />
      </button>

      {/* Center OK */}
      <button
        onClick={handleOK}
        className="w-24 h-24 rounded-full bg-surface border border-white/10 flex items-center justify-center hover:bg-surface/80 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10"
      >
        <span className="font-bold text-lg tracking-wider text-white/90">OK</span>
      </button>
    </div>
  );
}

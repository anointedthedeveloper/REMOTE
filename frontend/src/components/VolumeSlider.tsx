import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Volume1, Volume2, VolumeX } from 'lucide-react';

export function VolumeSlider() {
  const { socket } = useSocket();
  const [volume, setVolume] = useState(0);
  const [muted, setMuted] = useState(false);
  const sliderRef = useRef<HTMLInputElement>(null);
  
  // Throttle updates so we don't spam the TV
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!socket) return;
    
    const handleVolume = (data: any) => {
      if (typeof data.volume !== 'undefined') setVolume(data.volume);
      if (typeof data.muted !== 'undefined') setMuted(data.muted);
    };

    socket.on('tv:volume', handleVolume);
    return () => {
      socket.off('tv:volume', handleVolume);
    };
  }, [socket]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);

    const now = Date.now();
    if (now - lastUpdateRef.current > 100) { // 100ms throttle
      socket?.emit('tv:setVolume', val);
      lastUpdateRef.current = now;
      if (navigator.vibrate) navigator.vibrate(10); // subtle tick
    }
  };

  const handlePointerUp = () => {
    // Send final volume on release to ensure it syncs exactly
    socket?.emit('tv:setVolume', volume);
  };

  const toggleMute = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    socket?.emit('tv:button', 'MUTE');
  };

  return (
    <div className="flex flex-col gap-2 p-4 bg-surface/30 rounded-3xl border border-white/5 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-semibold text-textMuted uppercase tracking-widest">Volume</span>
        <span className="text-sm font-bold text-white/80">{volume}</span>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleMute} className="text-textMuted hover:text-white transition-colors p-2 active:scale-95">
          {muted || volume === 0 ? <VolumeX size={20} className="text-red-400" /> : <Volume1 size={20} />}
        </button>
        <input
          ref={sliderRef}
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleChange}
          onPointerUp={handlePointerUp}
          className="w-full h-2 bg-white/10 rounded-full appearance-none outline-none focus:outline-none cursor-pointer accent-primary"
        />
        <Volume2 size={20} className="text-textMuted" />
      </div>
    </div>
  );
}

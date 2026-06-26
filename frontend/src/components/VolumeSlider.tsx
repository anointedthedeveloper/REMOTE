import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Volume1, Volume2, VolumeX, Plus, Minus } from 'lucide-react';

export function VolumeSlider() {
  const { socket } = useSocket();
  const [volume, setVolume] = useState(20);
  const [muted, setMuted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const localVolRef = useRef(20); // track without re-render during drag
  const throttleRef = useRef(0);
  const longPressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep in sync with TV
  useEffect(() => {
    if (!socket) return;
    const handleVolume = (data: { volume: number; muted: boolean }) => {
      if (!isDragging) {
        setVolume(data.volume ?? 0);
        localVolRef.current = data.volume ?? 0;
      }
      setMuted(data.muted ?? false);
    };
    socket.on('tv:volume', handleVolume);
    return () => { socket.off('tv:volume', handleVolume); };
  }, [socket, isDragging]);

  const sendVolume = useCallback((val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    const now = Date.now();
    if (now - throttleRef.current > 80) { // 80ms throttle for smooth feel
      socket?.emit('tv:setVolume', clamped);
      throttleRef.current = now;
    }
  }, [socket]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    localVolRef.current = val;
    sendVolume(val);
    if (navigator.vibrate) navigator.vibrate(5);
  };

  const handleSliderUp = () => {
    setIsDragging(false);
    // Final sync on release
    socket?.emit('tv:setVolume', localVolRef.current);
  };

  // Long-press logic for +/-
  const startLongPress = (dir: 1 | -1) => {
    if (navigator.vibrate) navigator.vibrate(20);
    const step = () => {
      const next = Math.max(0, Math.min(100, localVolRef.current + dir));
      localVolRef.current = next;
      setVolume(next);
      socket?.emit('tv:setVolume', next);
    };
    step(); // immediate first step
    longPressRef.current = setInterval(step, 150);
  };

  const stopLongPress = () => {
    if (longPressRef.current) {
      clearInterval(longPressRef.current);
      longPressRef.current = null;
    }
  };

  const toggleMute = () => {
    if (navigator.vibrate) navigator.vibrate(20);
    socket?.emit('tv:setMute', !muted);
  };

  const volIcon = muted || volume === 0 ? <VolumeX size={16} className="text-red-400" /> :
    volume < 50 ? <Volume1 size={16} className="text-primary" /> :
    <Volume2 size={16} className="text-primary" />;

  return (
    <div className="flex flex-col gap-2 px-3 py-3 bg-white/5 rounded-2xl border border-white/8 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <button
          onClick={toggleMute}
          className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-textMuted hover:text-white transition-colors active:scale-95 px-1 py-0.5"
        >
          {volIcon}
          <span>{muted ? 'Muted' : 'Volume'}</span>
        </button>
        <span className="text-sm font-bold text-white tabular-nums w-8 text-right">{muted ? '—' : volume}</span>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-2">
        {/* Minus button */}
        <button
          onPointerDown={() => startLongPress(-1)}
          onPointerUp={stopLongPress}
          onPointerLeave={stopLongPress}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white active:scale-90 transition-all select-none shrink-0"
        >
          <Minus size={14} />
        </button>

        {/* Range slider */}
        <div className="flex-1 relative flex items-center">
          <div
            className="absolute left-0 h-1.5 rounded-full bg-primary transition-none pointer-events-none"
            style={{ width: `${volume}%`, opacity: muted ? 0.3 : 1 }}
          />
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={volume}
            onChange={handleSliderChange}
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={handleSliderUp}
            className="w-full h-1.5 appearance-none bg-white/10 rounded-full outline-none cursor-pointer relative z-10"
            style={{
              accentColor: 'var(--color-primary)',
              WebkitAppearance: 'none',
            }}
          />
        </div>

        {/* Plus button */}
        <button
          onPointerDown={() => startLongPress(1)}
          onPointerUp={stopLongPress}
          onPointerLeave={stopLongPress}
          className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 hover:text-white active:scale-90 transition-all select-none shrink-0"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

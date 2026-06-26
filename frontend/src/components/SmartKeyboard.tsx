import { useState, useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Keyboard, X, CheckCircle2 } from 'lucide-react';

/**
 * SmartKeyboard – captures all physical keyboard input and sends it straight
 * to the TV. Works like this:
 *  - A hidden input keeps permanent focus, intercepting every keystroke.
 *  - Character keys → tv:keyboardInput (sent char-by-char, instant)
 *  - Enter → tv:enterKey
 *  - Backspace → tv:button BACK
 *  - Arrow keys → tv:button UP/DOWN/LEFT/RIGHT
 *  - Escape → tv:button HOME
 *
 * The mode can be toggled on/off. When on, a visible indicator pulses
 * at the bottom of the screen so users know keystrokes are going to the TV.
 */
export function SmartKeyboard() {
  const { socket } = useSocket();
  const [active, setActive] = useState(false);
  const [lastKey, setLastKey] = useState('');
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const lastSentRef = useRef('');

  // Keep focus on the hidden input while active
  const refocusHidden = useCallback(() => {
    if (active && hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  }, [active]);

  useEffect(() => {
    if (active) {
      // Small delay to let any current focus settle
      setTimeout(() => hiddenInputRef.current?.focus(), 50);
      window.addEventListener('click', refocusHidden);
      window.addEventListener('touchend', refocusHidden);
    }
    return () => {
      window.removeEventListener('click', refocusHidden);
      window.removeEventListener('touchend', refocusHidden);
    };
  }, [active, refocusHidden]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Don't prevent native input from working in the hidden field
    if (navigator.vibrate) navigator.vibrate(8);

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        socket?.emit('tv:enterKey');
        setLastKey('↵ Enter');
        break;
      case 'Backspace':
        e.preventDefault();
        // Send a delete character
        socket?.emit('tv:keyboardInput', '\b');
        setLastKey('⌫ Backspace');
        break;
      case 'ArrowUp':
        e.preventDefault();
        socket?.emit('tv:button', 'UP');
        setLastKey('↑');
        break;
      case 'ArrowDown':
        e.preventDefault();
        socket?.emit('tv:button', 'DOWN');
        setLastKey('↓');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        socket?.emit('tv:button', 'LEFT');
        setLastKey('←');
        break;
      case 'ArrowRight':
        e.preventDefault();
        socket?.emit('tv:button', 'RIGHT');
        setLastKey('→');
        break;
      case 'Escape':
        e.preventDefault();
        socket?.emit('tv:button', 'BACK');
        setLastKey('⎋ Esc');
        break;
      default:
        // Let normal character input happen via onChange
        break;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Find what was newly typed (difference from last sent)
    const newChars = val.slice(lastSentRef.current.length);
    if (newChars) {
      socket?.emit('tv:keyboardInput', newChars);
      setLastKey(newChars);
    }
    lastSentRef.current = val;
    // Keep the hidden input from growing unbounded
    if (val.length > 200) {
      e.target.value = val.slice(-100);
      lastSentRef.current = e.target.value;
    }
  };

  const toggle = () => {
    const next = !active;
    setActive(next);
    if (navigator.vibrate) navigator.vibrate(next ? [20, 10, 20] : 30);
    setLastKey('');
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={toggle}
        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all active:scale-95 ${
          active
            ? 'bg-primary/20 border-primary/50 text-primary shadow-[0_0_15px_rgba(139,92,246,0.3)]'
            : 'bg-white/5 border-white/10 text-textMuted hover:bg-white/10 hover:text-white'
        }`}
      >
        {active ? <CheckCircle2 size={16} /> : <Keyboard size={16} />}
        <span>{active ? 'Keyboard: ON' : 'Keyboard Mode'}</span>
        {active && lastKey && (
          <span className="ml-auto font-bold text-white/80 bg-white/10 px-2 py-0.5 rounded-lg text-xs">
            {lastKey}
          </span>
        )}
      </button>

      {/* Hidden input captures all keystrokes while active */}
      {active && (
        <input
          ref={hiddenInputRef}
          type="text"
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          className="absolute opacity-0 pointer-events-none w-0 h-0 border-0 p-0"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-hidden="true"
        />
      )}

      {/* Floating indicator bar when active */}
      {active && (
        <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-primary/90 backdrop-blur-xl rounded-full shadow-[0_0_20px_rgba(139,92,246,0.6)] text-white text-xs font-semibold animate-in slide-in-from-bottom-4 duration-300">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          Keyboard → TV
          {lastKey && <span className="ml-1 opacity-80">· {lastKey}</span>}
          <button
            onClick={(e) => { e.stopPropagation(); toggle(); }}
            className="ml-2 hover:opacity-70 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </>
  );
}

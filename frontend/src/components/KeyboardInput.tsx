import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Keyboard, Send } from 'lucide-react';

export function KeyboardInput() {
  const { socket } = useSocket();
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    socket?.emit('tv:keyboardInput', text);
    socket?.emit('tv:enterKey');
    setText('');
    
    if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mt-4 flex items-center gap-2 bg-surface/50 border border-white/5 p-2 rounded-2xl backdrop-blur-sm">
      <div className="text-textMuted pl-2">
        <Keyboard size={20} />
      </div>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type here..."
        className="flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 text-sm px-2"
      />
      <button 
        type="submit"
        disabled={!text.trim()}
        className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center disabled:opacity-50 disabled:bg-white/10"
      >
        <Send size={16} />
      </button>
    </form>
  );
}

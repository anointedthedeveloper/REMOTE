import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { LayoutGrid, Loader2 } from 'lucide-react';

export function AppGrid() {
  const { socket } = useSocket();
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (socket) {
      socket.emit('tv:getApps', (response: any[]) => {
        setApps(response);
        setLoading(false);
      });
    }
  }, [socket]);

  const launchApp = (appId: string) => {
    if (navigator.vibrate) navigator.vibrate(50);
    socket?.emit('tv:launchApp', appId);
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-textMuted" />
      </div>
    );
  }

  return (
    <div className="w-full bg-surface/30 border border-white/5 p-4 rounded-3xl">
      <div className="flex items-center gap-2 mb-4 px-2">
        <LayoutGrid size={18} className="text-primary" />
        <h3 className="font-semibold">Apps</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
        {apps.slice(0, 12).map((app) => (
          <button
            key={app.id}
            onClick={() => launchApp(app.id)}
            className="flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="w-14 h-14 rounded-2xl bg-surface border border-white/10 overflow-hidden shadow-sm flex items-center justify-center p-1">
              {app.icon ? (
                // LG TV App icons are sometimes provided as URLs or local paths on the TV.
                // We'll just show the title if we can't reliably render the icon from the TV
                <div className="w-full h-full bg-white/5 rounded-xl flex items-center justify-center text-[10px] text-center font-bold text-white/50 break-words leading-tight">
                  {app.title.substring(0, 8)}
                </div>
              ) : (
                <div className="w-full h-full bg-white/5 rounded-xl flex items-center justify-center text-xs font-bold text-white/50">
                  {app.title.substring(0, 3)}
                </div>
              )}
            </div>
            <span className="text-[10px] text-textMuted truncate w-full text-center">{app.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { Loader2 } from 'lucide-react';

const BACKEND_URL = `http://${window.location.hostname}:3001`;

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

  const getIconUrl = (app: any): string | null => {
    // LG TV provides icon paths that can be relative or absolute URLs
    const icon = app.icon || app.largeIcon || app.mediumLargeIcon;
    if (!icon) return null;
    // If it's already a full http URL, proxy it through our backend
    if (icon.startsWith('http')) {
      return `${BACKEND_URL}/api/tv-icon?url=${encodeURIComponent(icon)}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <Loader2 className="animate-spin text-primary" size={28} />
        <p className="text-xs text-textMuted">Loading apps...</p>
      </div>
    );
  }

  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <p className="text-sm text-textMuted">No apps found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3 pb-2 px-1">
      {apps.map((app) => {
        const iconUrl = getIconUrl(app);
        return (
          <button
            key={app.id}
            onClick={() => launchApp(app.id)}
            className="flex flex-col items-center gap-2 transition-transform hover:scale-105 active:scale-95 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-surface border border-white/10 overflow-hidden shadow-sm flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-[0_0_12px_rgba(139,92,246,0.4)] transition-all">
              {iconUrl ? (
                <img
                  src={iconUrl}
                  alt={app.title}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    // On error, show text fallback
                    (e.target as HTMLImageElement).style.display = 'none';
                    const parent = (e.target as HTMLImageElement).parentElement;
                    if (parent) {
                      parent.innerHTML = `<span class="text-[10px] font-bold text-white/50 px-1 text-center break-words leading-tight">${app.title.substring(0, 8)}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-[10px] font-bold text-white/50 px-1 text-center break-words leading-tight">
                  {app.title.substring(0, 8)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-textMuted group-hover:text-white/80 transition-colors truncate w-full text-center">{app.title}</span>
          </button>
        );
      })}
    </div>
  );
}

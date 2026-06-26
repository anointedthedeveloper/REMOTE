import { useState, useEffect } from 'react';
import { SocketProvider, useSocket } from './hooks/useSocket';
import { RemotePage } from './pages/RemotePage';
import { Tv, KeyRound, Wifi, Loader2, PlugZap } from 'lucide-react';

function SetupOrRemote() {
  const { socket, isConnected } = useSocket();
  const [tvs, setTvs] = useState<any[]>([]);
  const [tvStatus, setTvStatus] = useState<'disconnected' | 'connecting' | 'pin' | 'connected'>('disconnected');
  const [manualIp, setManualIp] = useState('');

  useEffect(() => {
    if (!isConnected) {
      setTvStatus('disconnected');
    }
  }, [isConnected]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('tv:discovered', (devices) => {
      setTvs(devices);
    });

    socket.on('tv:status', (data) => {
      if (data.status === 'connected') {
        setTvStatus('connected');
      } else if (data.status === 'pin') {
        setTvStatus('pin');
      } else if (data.status === 'disconnected' || data.status === 'error') {
        setTvStatus('disconnected');
      } else if (data.status === 'connecting') {
        setTvStatus('connecting');
      }
    });

    return () => {
      socket.off('tv:discovered');
      socket.off('tv:status');
    };
  }, [socket]);

  const connectToTv = (ip: string) => {
    if (!ip.trim()) return;
    setTvStatus('connecting');
    socket?.emit('tv:connect', ip.trim());
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="animate-spin mb-4 text-primary" size={32} />
        <p>Connecting to backend...</p>
      </div>
    );
  }

  if (tvStatus === 'connected') {
    return <RemotePage />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center pt-12 px-4 pb-12 text-white">
      <div className="w-full max-w-md flex flex-col gap-4">

        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-3xl font-bold text-white">LG Remote</h1>
          <p className="text-textMuted text-sm mt-1">Connect to your LG webOS Smart TV</p>
        </div>

        {/* PIN Entry Screen */}
        {tvStatus === 'pin' && (
          <div className="bg-surface p-6 rounded-2xl border border-white/10 shadow-xl text-center flex flex-col items-center gap-4">
            <KeyRound size={48} className="text-primary animate-pulse" />
            <h2 className="text-2xl font-bold">Enter TV PIN</h2>
            <p className="text-textMuted text-sm">Look at your TV screen — a PIN code is displayed. Enter it below.</p>
            <input
              id="pin-input"
              type="text"
              inputMode="numeric"
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center text-3xl tracking-[0.5em] font-mono focus:outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.currentTarget.value) {
                  socket?.emit('tv:submitPin', e.currentTarget.value);
                  setTvStatus('connecting');
                }
              }}
              autoFocus
            />
            <button
              onClick={() => {
                const input = document.getElementById('pin-input') as HTMLInputElement;
                if (input?.value) {
                  socket?.emit('tv:submitPin', input.value);
                  setTvStatus('connecting');
                }
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Confirm PIN
            </button>
          </div>
        )}

        {/* Connecting spinner */}
        {tvStatus === 'connecting' && (
          <div className="bg-surface p-8 rounded-2xl border border-white/10 shadow-xl text-center flex flex-col items-center gap-4">
            <Loader2 size={48} className="text-primary animate-spin" />
            <h2 className="text-xl font-bold">Connecting...</h2>
          </div>
        )}

        {/* Discovery + Manual IP */}
        {tvStatus === 'disconnected' && (
          <>
            {/* Discovered TVs */}
            <div className="bg-surface p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg text-primary">
                  <Wifi size={20} />
                </div>
                <h2 className="text-lg font-bold">Auto Discover</h2>
              </div>
              <p className="text-textMuted text-xs -mt-2">
                Make sure "LG Connect Apps" is enabled in your TV's network settings.
              </p>

              {tvs.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-white/20 rounded-xl flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-textMuted" size={20} />
                  <p className="text-textMuted text-sm">Scanning local network...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {tvs.map((tv, idx) => (
                    <button
                      key={idx}
                      onClick={() => connectToTv(tv.ip)}
                      className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <Tv className="text-white/70" size={24} />
                        <div>
                          <h3 className="font-semibold text-white">{tv.name}</h3>
                          <p className="text-xs text-textMuted">
                            {tv.ip}{tv.modelName ? ` · ${tv.modelName}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-primary text-sm font-medium">Connect →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manual IP Entry */}
            <div className="bg-surface p-6 rounded-2xl border border-white/10 shadow-xl flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg text-white/70">
                  <PlugZap size={20} />
                </div>
                <h2 className="text-lg font-bold">Manual Connect</h2>
              </div>
              <div className="flex gap-2">
                <input
                  id="manual-ip"
                  type="text"
                  placeholder="192.168.1.100"
                  value={manualIp}
                  onChange={(e) => setManualIp(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') connectToTv(manualIp); }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-primary transition-colors"
                />
                <button
                  onClick={() => connectToTv(manualIp)}
                  disabled={!manualIp.trim()}
                  className="bg-primary hover:bg-primary/90 disabled:opacity-40 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors text-sm"
                >
                  Connect
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default function App() {
  return (
    <SocketProvider>
      <SetupOrRemote />
    </SocketProvider>
  );
}

import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { RemoteButton } from '../components/RemoteButton';
import { DPad } from '../components/DPad';
import { MousePad } from '../components/MousePad';
import { AppGrid } from '../components/AppGrid';
import { KeyboardInput } from '../components/KeyboardInput';
import { VolumeSlider } from '../components/VolumeSlider';
import { KeyboardForwarder } from '../components/KeyboardForwarder';
import {
  Power, Home, Settings, ArrowLeft, VolumeX,
  Play, Pause, Square, FastForward, Rewind,
  MousePointer2, Tv2, LayoutGrid, Keyboard,
  ChevronUp, ChevronDown
} from 'lucide-react';

type Tab = 'remote' | 'apps' | 'mouse' | 'keyboard';

export function RemotePage() {
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<Tab>('remote');

  const btn = (name: string) => {
    if (navigator.vibrate) navigator.vibrate(15);
    socket?.emit('tv:button', name);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'remote', label: 'Remote', icon: <Tv2 size={18} /> },
    { id: 'apps', label: 'Apps', icon: <LayoutGrid size={18} /> },
    { id: 'mouse', label: 'Mouse', icon: <MousePointer2 size={18} /> },
    { id: 'keyboard', label: 'Keys', icon: <Keyboard size={18} /> },
  ];

  return (
    <div className="h-[100dvh] w-full max-w-md mx-auto bg-background text-textMain flex flex-col overflow-hidden">

      {/* ─── Top Status Bar ─── */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
          <span className="text-sm font-semibold text-white/80">LG Smart TV</span>
        </div>
        <button
          onClick={() => { if (navigator.vibrate) navigator.vibrate(30); socket?.emit('tv:button', 'POWER'); }}
          className="w-10 h-10 rounded-full bg-surface border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/20 hover:border-red-400 transition-all active:scale-90 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
        >
          <Power size={18} />
        </button>
      </div>

      {/* ─── Main Content (scrollable per-tab) ─── */}
      <div className="flex-1 overflow-hidden relative">

        {/* REMOTE TAB */}
        {activeTab === 'remote' && (
          <div className="h-full overflow-y-auto px-4 py-2 flex flex-col gap-4 scrollbar-hide">
            {/* Nav row */}
            <div className="flex justify-between items-center px-2">
              <RemoteButton variant="circle" onClick={() => btn('BACK')}>
                <ArrowLeft size={18} />
              </RemoteButton>
              <RemoteButton variant="circle" onClick={() => btn('HOME')}>
                <Home size={18} />
              </RemoteButton>
              <RemoteButton variant="circle" onClick={() => btn('MENU')}>
                <Settings size={18} />
              </RemoteButton>
            </div>

            {/* D-Pad */}
            <div className="flex justify-center">
              <DPad />
            </div>

            {/* Volume Slider */}
            <VolumeSlider />

            {/* Mute + Channel row */}
            <div className="flex items-center justify-between bg-surface/40 rounded-2xl border border-white/5 px-4 py-3 backdrop-blur-sm">
              <button
                onClick={() => btn('MUTE')}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-white/10 text-white/70 hover:bg-white/10 active:scale-95 transition-all"
              >
                <VolumeX size={16} />
                <span className="text-xs font-medium">Mute</span>
              </button>
              <div className="flex items-center gap-1 bg-surface border border-white/10 rounded-xl overflow-hidden">
                <button onClick={() => btn('CHANNELDOWN')} className="px-3 py-2 hover:bg-white/10 active:scale-95 transition-all text-white/70">
                  <ChevronDown size={16} />
                </button>
                <span className="text-[10px] font-semibold text-textMuted px-1">CH</span>
                <button onClick={() => btn('CHANNELUP')} className="px-3 py-2 hover:bg-white/10 active:scale-95 transition-all text-white/70">
                  <ChevronUp size={16} />
                </button>
              </div>
            </div>

            {/* Media Controls */}
            <div className="grid grid-cols-6 gap-2 bg-surface/40 rounded-2xl border border-white/5 p-3 backdrop-blur-sm">
              {[
                { icon: <Rewind size={16} />, name: 'REWIND' },
                { icon: <SkipBack size={16} />, name: 'SKIP_BACKWARD' },
                { icon: <Play size={16} />, name: 'PLAY' },
                { icon: <Pause size={16} />, name: 'PAUSE' },
                { icon: <SkipForward size={16} />, name: 'SKIP_FORWARD' },
                { icon: <FastForward size={16} />, name: 'FASTFORWARD' },
              ].map(({ icon, name }) => (
                <button
                  key={name}
                  onClick={() => btn(name)}
                  className="h-10 flex items-center justify-center rounded-xl bg-surface border border-white/10 text-white/70 hover:bg-white/15 hover:text-white hover:shadow-[0_0_12px_rgba(255,255,255,0.1)] active:scale-90 transition-all"
                >
                  {icon}
                </button>
              ))}
            </div>

            {/* Stop + Enter row */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => btn('STOP')}
                className="h-12 flex items-center justify-center gap-2 rounded-2xl bg-surface border border-white/10 text-white/70 hover:bg-white/10 active:scale-95 transition-all"
              >
                <Square size={16} />
                <span className="text-sm font-medium">Stop</span>
              </button>
              <button
                onClick={() => btn('ENTER')}
                className="h-12 flex items-center justify-center gap-2 rounded-2xl bg-primary/20 border border-primary/40 text-primary hover:bg-primary/30 active:scale-95 transition-all font-semibold shadow-[0_0_15px_rgba(139,92,246,0.2)]"
              >
                OK / Enter
              </button>
            </div>

            {/* Number pad */}
            <div className="grid grid-cols-3 gap-2">
              {['1','2','3','4','5','6','7','8','9','','0',''].map((num, i) => (
                num ? (
                  <button
                    key={num + i}
                    onClick={() => btn(num)}
                    className="h-12 text-lg font-semibold rounded-2xl bg-surface border border-white/8 text-white/80 hover:bg-white/10 hover:text-white active:scale-95 transition-all"
                  >
                    {num}
                  </button>
                ) : (
                  <div key={i} className="h-12" />
                )
              ))}
            </div>

            {/* Bottom spacer */}
            <div className="h-2" />
          </div>
        )}

        {/* APPS TAB */}
        {activeTab === 'apps' && (
          <div className="h-full overflow-y-auto px-4 py-3 scrollbar-hide">
            <p className="text-xs text-textMuted font-medium mb-3 tracking-wider uppercase">Installed Apps</p>
            <AppGrid />
            <div className="h-2" />
          </div>
        )}

        {/* MOUSE TAB */}
        {activeTab === 'mouse' && (
          <div className="h-full flex flex-col px-4 py-3 gap-4">
            <MousePad />
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <RemoteButton variant="pill" onClick={() => btn('BACK')}>
                <ArrowLeft size={16} className="mr-2" /> Back
              </RemoteButton>
              <RemoteButton variant="pill" onClick={() => btn('HOME')}>
                <Home size={16} className="mr-2" /> Home
              </RemoteButton>
            </div>
          </div>
        )}

        {/* KEYBOARD TAB */}
        {activeTab === 'keyboard' && (
          <div className="h-full flex flex-col px-4 py-3 gap-4 overflow-y-auto scrollbar-hide">
            <div>
              <p className="text-xs text-textMuted font-medium mb-2 tracking-wider uppercase">Text Input</p>
              <KeyboardInput />
            </div>
            <div>
              <p className="text-xs text-textMuted font-medium mb-2 tracking-wider uppercase">PC Keyboard Mode</p>
              <KeyboardForwarder />
              <p className="text-xs text-textMuted mt-3 leading-relaxed">
                When enabled, every key you press on your physical keyboard (letters, arrows, Enter, Backspace) will be sent directly to the TV.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Bottom Tab Bar ─── */}
      <div className="shrink-0 flex items-center bg-surface/80 backdrop-blur-xl border-t border-white/5 px-2 pb-safe">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (navigator.vibrate) navigator.vibrate(10); }}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all rounded-xl mx-1 ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-textMuted hover:text-white/60'
            }`}
          >
            <div className={`transition-all ${activeTab === tab.id ? 'drop-shadow-[0_0_6px_rgba(139,92,246,0.8)]' : ''}`}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            {activeTab === tab.id && (
              <div className="absolute bottom-0 w-8 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Missing icon imports (lucide-react)
function SkipBack({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>;
}
function SkipForward({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>;
}

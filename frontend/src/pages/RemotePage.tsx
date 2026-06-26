import { useState, useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { RemoteButton } from '../components/RemoteButton';
import { DPad } from '../components/DPad';
import { MousePad } from '../components/MousePad';
import { AppGrid } from '../components/AppGrid';
import { KeyboardInput } from '../components/KeyboardInput';
import { VolumeSlider } from '../components/VolumeSlider';
import { KeyboardForwarder } from '../components/KeyboardForwarder';
import {
  Power, Home, Settings, ArrowLeft, VolumeX, Tv2, LayoutGrid,
  MousePointer2, Keyboard, ChevronUp, ChevronDown,
  Play, Pause, FastForward, Rewind, Square,
  Subtitles, Maximize, BookOpen, List, MonitorOff,
  Zap, Palette, Volume2, Radio,
} from 'lucide-react';

type Tab = 'remote' | 'apps' | 'mouse' | 'settings';

const PICTURE_MODES = ['cinema', 'eco', 'expert1', 'expert2', 'game', 'normal', 'photo', 'sports', 'technicolor', 'vivid', 'hdrEffect'];
const SOUND_MODES = ['standard', 'news', 'music', 'cinema', 'sports', 'game'];

export function RemotePage() {
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<Tab>('remote');
  const [foregroundApp, setForegroundApp] = useState<string>('');
  const [picMode, setPicMode] = useState('');
  const [soundMode, setSoundMode] = useState('');
  const [inputs, setInputs] = useState<any[]>([]);
  const [channel, setChannel] = useState<any>(null);

  const btn = (name: string) => {
    if (navigator.vibrate) navigator.vibrate(12);
    socket?.emit('tv:button', name);
  };

  useEffect(() => {
    if (!socket) return;
    socket.on('tv:foregroundApp', (d: any) => setForegroundApp(d?.appId || ''));

    // Fetch initial data
    socket.emit('tv:getInputs', (res: any[]) => setInputs(res));
    socket.emit('tv:getPictureSettings', (res: any) => {
      if (res?.pictureMode) setPicMode(res.pictureMode);
    });
    socket.emit('tv:getSoundSettings', (res: any) => {
      if (res?.soundMode) setSoundMode(res.soundMode);
    });
    socket.emit('tv:getCurrentChannel', (res: any) => {
      if (res?.channelNumber) setChannel(res);
    });

    return () => { socket.off('tv:foregroundApp'); };
  }, [socket]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'remote', label: 'Remote', icon: <Tv2 size={18} /> },
    { id: 'apps', label: 'Apps', icon: <LayoutGrid size={18} /> },
    { id: 'mouse', label: 'Mouse', icon: <MousePointer2 size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="h-[100dvh] w-full bg-background text-textMain flex flex-col overflow-hidden relative">

      {/* ── Animated live gradient background ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[120px] animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 rounded-full bg-violet-500/8 blur-[100px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-0 w-64 h-64 rounded-full bg-indigo-500/6 blur-[80px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '1s' }} />
      </div>

      {/* ── Desktop layout: sidebar + main ── */}
      {/* On desktop (md+) use a two-column layout, mobile stacks normally */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* ── Sidebar (desktop only) ── */}
        <div className="hidden md:flex flex-col w-56 border-r border-white/5 bg-surface/30 backdrop-blur-xl shrink-0">
          {/* Logo / Status */}
          <div className="px-5 pt-5 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
              <span className="text-sm font-bold text-white">LG Remote</span>
            </div>
            {foregroundApp && (
              <p className="text-[10px] text-textMuted truncate">App: {foregroundApp.split('.').pop()}</p>
            )}
            {channel && (
              <p className="text-[10px] text-textMuted">Ch {channel.channelNumber}: {channel.channelName}</p>
            )}
          </div>

          {/* Sidebar Nav */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary/20 text-primary border border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                    : 'text-textMuted hover:bg-white/5 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Power button in sidebar */}
          <div className="px-4 pb-5 flex flex-col gap-2">
            <button
              onClick={() => { if (navigator.vibrate) navigator.vibrate(30); socket?.emit('tv:screenOff'); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-textMuted hover:bg-white/5 hover:text-white transition-all border border-white/5"
            >
              <MonitorOff size={14} />
              Screen Off
            </button>
            <button
              onClick={() => { if (navigator.vibrate) navigator.vibrate(50); socket?.emit('tv:turnOff'); }}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 transition-all border border-red-500/20"
            >
              <Power size={14} />
              Power Off
            </button>
          </div>
        </div>

        {/* ── Main content area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Mobile top bar */}
          <div className="flex md:hidden items-center justify-between px-4 pt-4 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
              <span className="text-sm font-semibold text-white/80">LG Smart TV</span>
              {foregroundApp && <span className="text-[10px] text-textMuted ml-1">· {foregroundApp.split('.').pop()}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => socket?.emit('tv:screenOff')}
                className="w-8 h-8 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-white/60 hover:bg-white/10 active:scale-90 transition-all"
              >
                <MonitorOff size={14} />
              </button>
              <button
                onClick={() => { if (navigator.vibrate) navigator.vibrate(30); socket?.emit('tv:button', 'POWER'); }}
                className="w-8 h-8 rounded-xl bg-surface border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/20 active:scale-90 transition-all"
              >
                <Power size={15} />
              </button>
            </div>
          </div>

          {/* ── Tab Content ── */}
          <div className="flex-1 overflow-hidden">

            {/* REMOTE TAB */}
            {activeTab === 'remote' && (
              <div className="h-full md:grid md:grid-cols-2 md:gap-0 overflow-hidden flex flex-col">
                {/* Left column on desktop / top on mobile */}
                <div className="flex flex-col gap-3 overflow-y-auto px-4 py-3 scrollbar-hide md:border-r md:border-white/5">
                  {/* Nav row */}
                  <div className="flex justify-around">
                    {[
                      { icon: <ArrowLeft size={17} />, name: 'BACK', label: 'Back' },
                      { icon: <Home size={17} />, name: 'HOME', label: 'Home' },
                      { icon: <Settings size={17} />, name: 'MENU', label: 'Menu' },
                      { icon: <BookOpen size={17} />, name: 'INFO', label: 'Info' },
                      { icon: <List size={17} />, name: 'LIST', label: 'List' },
                    ].map(({ icon, name, label }) => (
                      <div key={name} className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => btn(name)}
                          className="w-11 h-11 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/70 hover:bg-white/10 hover:text-white active:scale-90 transition-all"
                        >
                          {icon}
                        </button>
                        <span className="text-[9px] text-textMuted">{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* D-Pad */}
                  <div className="flex justify-center">
                    <DPad />
                  </div>

                  {/* Volume */}
                  <VolumeSlider />

                  {/* Channel + Mute row */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => btn('MUTE')}
                      className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 active:scale-95 transition-all text-xs font-medium"
                    >
                      <VolumeX size={14} /> Mute
                    </button>
                    <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                      <button onClick={() => btn('CHANNELDOWN')} className="px-3 h-10 hover:bg-white/10 active:scale-90 transition-all text-white/60">
                        <ChevronDown size={15} />
                      </button>
                      <span className="text-[10px] text-textMuted px-1 font-semibold">CH</span>
                      <button onClick={() => btn('CHANNELUP')} className="px-3 h-10 hover:bg-white/10 active:scale-90 transition-all text-white/60">
                        <ChevronUp size={15} />
                      </button>
                    </div>
                    <button
                      onClick={() => socket?.emit('tv:openGuide')}
                      className="flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 active:scale-95 transition-all text-xs font-medium"
                    >
                      <BookOpen size={14} /> Guide
                    </button>
                  </div>

                  {/* Bottom spacer for mobile */}
                  <div className="h-1 md:hidden" />
                </div>

                {/* Right column on desktop / bottom on mobile */}
                <div className="flex flex-col gap-3 overflow-y-auto px-4 py-3 scrollbar-hide">
                  {/* Media Controls */}
                  <div className="grid grid-cols-6 gap-1.5 bg-white/5 rounded-2xl border border-white/8 p-3">
                    {[
                      { icon: <Rewind size={15} />, name: 'REWIND' },
                      { icon: <SkipBackIcon size={15} />, name: 'SKIPBACKWARD' },
                      { icon: <Play size={15} />, name: 'PLAY' },
                      { icon: <Pause size={15} />, name: 'PAUSE' },
                      { icon: <SkipFwdIcon size={15} />, name: 'SKIPFORWARD' },
                      { icon: <FastForward size={15} />, name: 'FASTFORWARD' },
                    ].map(({ icon, name }) => (
                      <button
                        key={name}
                        onClick={() => btn(name)}
                        className="h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/15 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.1)] active:scale-90 transition-all"
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  {/* Stop + OK */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => btn('STOP')}
                      className="h-11 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 active:scale-95 transition-all text-sm"
                    >
                      <Square size={14} /> Stop
                    </button>
                    <button
                      onClick={() => btn('ENTER')}
                      className="h-11 flex items-center justify-center rounded-xl bg-primary/20 border border-primary/40 text-primary font-bold hover:bg-primary/30 active:scale-95 transition-all shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                    >
                      OK
                    </button>
                  </div>

                  {/* Color buttons */}
                  <div className="grid grid-cols-4 gap-2">
                    {(['RED', 'GREEN', 'YELLOW', 'BLUE'] as const).map(c => (
                      <button
                        key={c}
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(15); socket?.emit('tv:colorButton', c); }}
                        className={`h-10 rounded-xl border text-xs font-bold active:scale-90 transition-all ${
                          c === 'RED' ? 'bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30' :
                          c === 'GREEN' ? 'bg-green-500/20 border-green-500/40 text-green-400 hover:bg-green-500/30' :
                          c === 'YELLOW' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/30' :
                          'bg-blue-500/20 border-blue-500/40 text-blue-400 hover:bg-blue-500/30'
                        }`}
                      >
                        {c[0]}
                      </button>
                    ))}
                  </div>

                  {/* Number pad */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {['1','2','3','4','5','6','7','8','9','DASH','0','LAST'].map((num) => (
                      <button
                        key={num}
                        onClick={() => btn(num)}
                        className="h-11 text-base font-semibold rounded-xl bg-white/5 border border-white/8 text-white/70 hover:bg-white/10 hover:text-white active:scale-95 transition-all"
                      >
                        {num === 'DASH' ? '·' : num === 'LAST' ? '↩' : num}
                      </button>
                    ))}
                  </div>

                  {/* Extra features row */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: 'Ratio', icon: <Maximize size={13} />, action: () => socket?.emit('tv:cycleAspectRatio') },
                      { label: 'CC', icon: <Subtitles size={13} />, action: () => socket?.emit('tv:toggleCaption') },
                      { label: 'Exit', icon: <ArrowLeft size={13} />, action: () => btn('EXIT') },
                      { label: '3D', icon: <Zap size={13} />, action: () => socket?.emit('tv:toggle3D') },
                    ].map(({ label, icon, action }) => (
                      <button
                        key={label}
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(12); action(); }}
                        className="h-10 flex flex-col items-center justify-center gap-0.5 rounded-xl bg-white/5 border border-white/8 text-white/60 hover:bg-white/10 hover:text-white active:scale-90 transition-all"
                      >
                        {icon}
                        <span className="text-[9px] font-medium">{label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="h-1" />
                </div>
              </div>
            )}

            {/* APPS TAB */}
            {activeTab === 'apps' && (
              <div className="h-full overflow-y-auto px-4 py-3 scrollbar-hide">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-textMuted font-semibold tracking-widest uppercase">Installed Apps</p>
                </div>
                <AppGrid />
                <div className="h-4" />
              </div>
            )}

            {/* MOUSE / TOUCHPAD TAB */}
            {activeTab === 'mouse' && (
              <div className="h-full flex flex-col md:flex-row gap-4 px-4 py-3">
                <div className="flex-1">
                  <MousePad />
                </div>
                <div className="flex md:flex-col justify-center gap-3 shrink-0">
                  <RemoteButton variant="pill" onClick={() => btn('BACK')}>
                    <ArrowLeft size={15} className="mr-1" /> Back
                  </RemoteButton>
                  <RemoteButton variant="pill" onClick={() => btn('HOME')}>
                    <Home size={15} className="mr-1" /> Home
                  </RemoteButton>
                  <div className="hidden md:block mt-4">
                    <KeyboardForwarder />
                  </div>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="h-full overflow-y-auto px-4 py-3 scrollbar-hide flex flex-col gap-5">

                {/* Input Sources */}
                <Section title="Input Source" icon={<Radio size={14} />}>
                  <div className="grid grid-cols-2 gap-2">
                    {inputs.length === 0 && <p className="text-xs text-textMuted col-span-2 py-2">No external inputs detected</p>}
                    {inputs.map((inp: any) => (
                      <button
                        key={inp.id}
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(15); socket?.emit('tv:switchInput', inp.id); }}
                        className="h-10 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-white/70 hover:bg-primary/20 hover:text-primary hover:border-primary/40 active:scale-95 transition-all truncate px-2"
                      >
                        {inp.label || inp.id}
                      </button>
                    ))}
                  </div>
                </Section>

                {/* Picture Mode */}
                <Section title="Picture Mode" icon={<Palette size={14} />}>
                  <div className="flex flex-wrap gap-2">
                    {PICTURE_MODES.map(m => (
                      <button
                        key={m}
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(15); setPicMode(m); socket?.emit('tv:setPictureMode', m); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all active:scale-90 ${
                          picMode === m
                            ? 'bg-primary/25 border border-primary/50 text-primary'
                            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </Section>

                {/* Sound Mode */}
                <Section title="Sound Mode" icon={<Volume2 size={14} />}>
                  <div className="flex flex-wrap gap-2">
                    {SOUND_MODES.map(m => (
                      <button
                        key={m}
                        onClick={() => { if (navigator.vibrate) navigator.vibrate(15); setSoundMode(m); socket?.emit('tv:setSoundMode', m); }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium capitalize transition-all active:scale-90 ${
                          soundMode === m
                            ? 'bg-primary/25 border border-primary/50 text-primary'
                            : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </Section>

                {/* Text Input + Keyboard */}
                <Section title="Keyboard Input" icon={<Keyboard size={14} />}>
                  <KeyboardInput />
                  <div className="mt-2">
                    <KeyboardForwarder />
                  </div>
                </Section>

                {/* Screen controls */}
                <Section title="Power & Screen" icon={<Power size={14} />}>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => { if (navigator.vibrate) navigator.vibrate(20); socket?.emit('tv:screenOff'); }}
                      className="h-11 flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white/60 hover:bg-white/10 active:scale-95 transition-all"
                    >
                      <MonitorOff size={14} /> Screen Off
                    </button>
                    <button
                      onClick={() => { if (navigator.vibrate) navigator.vibrate(40); socket?.emit('tv:turnOff'); }}
                      className="h-11 flex items-center justify-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 hover:bg-red-500/20 active:scale-95 transition-all"
                    >
                      <Power size={14} /> Turn Off
                    </button>
                  </div>
                </Section>

                <div className="h-4" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Tab Bar ── */}
      <div className="md:hidden shrink-0 flex items-center bg-surface/80 backdrop-blur-2xl border-t border-white/5 pb-safe">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); if (navigator.vibrate) navigator.vibrate(10); }}
            className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-all ${
              activeTab === tab.id ? 'text-primary' : 'text-textMuted hover:text-white/60'
            }`}
          >
            <div className={activeTab === tab.id ? 'drop-shadow-[0_0_6px_rgba(139,92,246,0.9)]' : ''}>
              {tab.icon}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Helper section wrapper
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-textMuted">{icon}</span>
        <h3 className="text-xs font-bold tracking-widest uppercase text-textMuted">{title}</h3>
      </div>
      <div className="bg-white/5 rounded-2xl border border-white/8 p-3">
        {children}
      </div>
    </div>
  );
}

// SVG icons
function SkipBackIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>;
}
function SkipFwdIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>;
}

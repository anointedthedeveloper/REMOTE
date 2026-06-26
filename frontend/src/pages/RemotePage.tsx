import { useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import { RemoteButton } from '../components/RemoteButton';
import { DPad } from '../components/DPad';
import { MousePad } from '../components/MousePad';
import { AppGrid } from '../components/AppGrid';
import { KeyboardInput } from '../components/KeyboardInput';
import { VolumeSlider } from '../components/VolumeSlider';
import { KeyboardForwarder } from '../components/KeyboardForwarder';
import { Power, Home, Settings, ArrowLeft, VolumeX, Play, Pause, Square, FastForward, Rewind, MousePointer2 } from 'lucide-react';

export function RemotePage() {
  const { socket } = useSocket();
  const [activeTab, setActiveTab] = useState<'remote' | 'mouse'>('remote');

  const handleButton = (btn: string) => {
    socket?.emit('tv:button', btn);
  };

  const handlePower = () => {
    // Might require a different command for turn on via WOL, but this turns it off
    socket?.emit('tv:button', 'POWER');
  };

  return (
    <div className="min-h-screen bg-background text-textMain pb-20 pt-6 px-4 max-w-md mx-auto flex flex-col gap-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
          <span className="text-sm font-medium text-white/80">LG Smart TV</span>
        </div>
        <button 
          onClick={handlePower}
          className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center text-primary hover:bg-white/10 transition-colors shadow-sm"
        >
          <Power size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-surface rounded-xl p-1 border border-white/5">
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'remote' ? 'bg-white/10 text-white' : 'text-textMuted'}`}
          onClick={() => setActiveTab('remote')}
        >
          Basic Remote
        </button>
        <button 
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${activeTab === 'mouse' ? 'bg-white/10 text-white' : 'text-textMuted'}`}
          onClick={() => setActiveTab('mouse')}
        >
          <MousePointer2 size={16} /> Touchpad
        </button>
      </div>

      {activeTab === 'remote' ? (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Main Controls row 1 */}
          <div className="flex justify-between px-2">
            <RemoteButton variant="circle" onClick={() => handleButton('BACK')}>
              <ArrowLeft size={20} />
            </RemoteButton>
            <RemoteButton variant="circle" onClick={() => handleButton('HOME')}>
              <Home size={20} />
            </RemoteButton>
            <RemoteButton variant="circle" onClick={() => handleButton('MENU')}>
              <Settings size={20} />
            </RemoteButton>
          </div>

          {/* D-PAD */}
          <div className="my-2">
            <DPad />
          </div>

          {/* Volume and Channel */}
          <div className="flex flex-col gap-4">
            <VolumeSlider />
            
            <div className="flex justify-between items-center bg-surface/30 rounded-3xl p-4 border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <RemoteButton variant="circle" className="bg-surface hover:bg-white/10 border-white/10 shadow-[0_0_10px_rgba(255,255,255,0.05)] hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all" onClick={() => handleButton('MUTE')}>
                  <VolumeX size={20} />
                </RemoteButton>
              </div>

              <div className="flex gap-4 items-center">
                <span className="text-xs font-semibold text-textMuted tracking-wider uppercase">Channel</span>
                <div className="flex bg-surface border border-white/10 rounded-full p-1 shadow-inner">
                  <button onClick={() => handleButton('CHANNELDOWN')} className="w-12 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors active:scale-95 text-white/80">
                    <ChevronDownIcon size={20} />
                  </button>
                  <button onClick={() => handleButton('CHANNELUP')} className="w-12 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors active:scale-95 text-white/80">
                    <ChevronUpIcon size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Media Controls */}
          <div className="grid grid-cols-3 gap-4 bg-surface/30 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
            <RemoteButton className="hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all" onClick={() => handleButton('PLAY')}><Play size={18} /></RemoteButton>
            <RemoteButton className="hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all" onClick={() => handleButton('PAUSE')}><Pause size={18} /></RemoteButton>
            <RemoteButton className="hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all" onClick={() => handleButton('STOP')}><Square size={18} /></RemoteButton>
            
            <RemoteButton className="hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all" onClick={() => handleButton('REWIND')}><Rewind size={18} /></RemoteButton>
            <RemoteButton className="hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all" onClick={() => handleButton('ENTER')}>OK</RemoteButton>
            <RemoteButton className="hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] transition-all" onClick={() => handleButton('FASTFORWARD')}><FastForward size={18} /></RemoteButton>
          </div>

          {/* Keyboard & Apps */}
          <div className="flex flex-col gap-4">
            <KeyboardInput />
            <KeyboardForwarder />
          </div>
          <div className="mt-4">
            <AppGrid />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-8 animate-in fade-in zoom-in-95 duration-200 mt-4">
          <MousePad />
          
          <div className="flex justify-between mt-4">
             <RemoteButton variant="pill" className="flex-1 mr-2" onClick={() => handleButton('BACK')}>
              <ArrowLeft size={16} className="mr-2" /> Back
            </RemoteButton>
            <RemoteButton variant="pill" className="flex-1 ml-2" onClick={() => handleButton('HOME')}>
              <Home size={16} className="mr-2" /> Home
            </RemoteButton>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple icons not natively in the lucide import above
function ChevronUpIcon({size}: {size: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>;
}
function ChevronDownIcon({size}: {size: number}) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>;
}

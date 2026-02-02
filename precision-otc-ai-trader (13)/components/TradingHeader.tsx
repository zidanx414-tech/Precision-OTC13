
import React, { useState, useEffect } from 'react';
import { Shield, Zap, Power } from 'lucide-react';

interface Props {
  isActive: boolean;
  setIsActive: (val: boolean) => void;
}

const TradingHeader: React.FC<Props> = ({ isActive, setIsActive }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex flex-col md:flex-row justify-between items-center p-6 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3 mb-4 md:mb-0">
        <div className={`p-2 rounded-lg transition-all duration-500 ${isActive ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-700'}`}>
          <Zap className={`w-6 h-6 fill-current ${isActive ? 'text-white' : 'text-zinc-400'}`} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white uppercase">Precision OTC AI</h1>
          <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase">
            {isActive ? (
              <span className="flex items-center gap-1 text-green-500">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                System Active
              </span>
            ) : (
              <span className="flex items-center gap-1 text-zinc-500">
                <span className="w-1.5 h-1.5 bg-zinc-700 rounded-full" />
                Standby Mode
              </span>
            )}
            <span className="text-zinc-800">|</span>
            <span className="text-zinc-600">V3.1.2-FINAL</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center gap-4 px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-2xl">
          <div className="flex flex-col items-end pr-4 border-r border-zinc-800">
            <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">System Power</span>
            <span className={`text-xs font-bold uppercase ${isActive ? 'text-green-500' : 'text-red-500'}`}>
              {isActive ? 'Live' : 'Off'}
            </span>
          </div>
          <button 
            onClick={() => setIsActive(!isActive)}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 flex items-center px-1 ${isActive ? 'bg-green-600/20 border border-green-500/50' : 'bg-zinc-800 border border-zinc-700'}`}
          >
            <div className={`w-4 h-4 rounded-full transition-all duration-300 flex items-center justify-center ${isActive ? 'translate-x-6 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'translate-x-0 bg-zinc-600'}`}>
              <Power className={`w-2.5 h-2.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
            </div>
          </button>
        </div>

        <div className="hidden sm:flex flex-col items-end">
          <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">UTC Clock</span>
          <span className="text-2xl font-black mono text-zinc-100 tabular-nums leading-none">{time.toLocaleTimeString('en-GB', { hour12: false })}</span>
        </div>
      </div>
    </header>
  );
};

export default TradingHeader;

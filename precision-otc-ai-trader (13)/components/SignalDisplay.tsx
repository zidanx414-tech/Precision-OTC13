
import React from 'react';
import { Signal, Timeframe } from '../types';
import { TrendingUp, TrendingDown, Timer, Target, Info, AlertTriangle, Key, RefreshCw, Zap } from 'lucide-react';

interface Props {
  signal: Signal | null;
  loading: boolean;
  timeframe: Timeframe;
  isQuotaExhausted?: boolean;
  onRetry?: () => void;
}

const SignalDisplay: React.FC<Props> = ({ signal, loading, timeframe, isQuotaExhausted, onRetry }) => {
  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-400 font-bold">এনালাইসিস চলছে... (Analyzing Markets)</p>
      </div>
    );
  }

  if (isQuotaExhausted) {
    return (
      <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <Key className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">API লিমিট শেষ</h3>
        <p className="text-zinc-500 mb-6">দয়া করে কিছুক্ষণ অপেক্ষা করুন অথবা নতুন এপিআই কি ব্যবহার করুন।</p>
        <button onClick={onRetry} className="px-6 py-2 bg-zinc-800 border border-zinc-700 rounded-xl font-bold">RETRY</button>
      </div>
    );
  }

  if (!signal || signal.direction === 'WAIT' || (signal.confidence < 70 && signal.secondsRemaining > 0)) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mb-6">
          <Target className="w-10 h-10 text-zinc-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">হাই-একুরেন্সি সিগন্যাল খুঁজছি...</h3>
        <p className="text-zinc-500 max-w-sm">মার্কেট এখন কনফিউজড। ভালো মুভমেন্ট পাওয়া গেলেই এখানে সিগন্যাল আসবে।</p>
      </div>
    );
  }

  const isCall = signal.direction === 'CALL';
  const isPrepare = signal.secondsRemaining <= 15 && signal.secondsRemaining > 0;

  return (
    <div className={`bg-zinc-900 border ${isCall ? 'border-green-500/30' : 'border-red-500/30'} rounded-2xl p-6 lg:p-8 transition-all duration-500 relative overflow-hidden`}>
      {isPrepare && (
        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500 animate-pulse z-10" />
      )}
      
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-3 h-3 rounded-full ${isCall ? 'bg-green-500' : 'bg-red-500'} animate-ping`} />
            <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Premium Signal</h2>
          </div>
          <h3 className="text-3xl font-black text-white">{signal.market}</h3>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">ACCURACY</p>
          <div className={`text-4xl font-black mono ${isCall ? 'text-green-500' : 'text-red-500'}`}>
            {signal.confidence}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 ${isCall ? 'bg-green-500/10 border-green-500/40' : 'bg-red-500/10 border-red-500/40'} ${isPrepare ? 'scale-105 transition-transform' : ''}`}>
          {isCall ? <TrendingUp className="w-16 h-16 text-green-500 mb-4" /> : <TrendingDown className="w-16 h-16 text-red-500 mb-4" />}
          <span className={`text-6xl font-black italic tracking-tighter ${isCall ? 'text-green-500' : 'text-red-500'}`}>
            {signal.direction}
          </span>
          {isPrepare && (
            <div className="mt-4 flex items-center gap-2 text-yellow-500 animate-bounce">
              <Zap className="w-4 h-4 fill-current" />
              <span className="text-xs font-black uppercase tracking-widest">ট্রেড নিতে তৈরি হোন (PREPARE)</span>
            </div>
          )}
        </div>

        <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-end border-b border-zinc-700 pb-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">ENTRY</span>
              <span className="text-xl font-bold mono text-white">{signal.entryTime}</span>
            </div>
            <div className="flex justify-between items-end border-b border-zinc-700 pb-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase">EXPIRY</span>
              <span className="text-xl font-bold mono text-zinc-300">{signal.expiryTime}</span>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center">
             <div className="text-[10px] text-zinc-500 font-black uppercase mb-1">পরবর্তী ক্যান্ডেল শুরু হতে বাকি</div>
             <div className={`text-5xl font-black mono tabular-nums ${isPrepare ? 'text-yellow-500' : 'text-blue-400'}`}>
               00:{signal.secondsRemaining.toString().padStart(2, '0')}
             </div>
          </div>
        </div>
      </div>

      {signal.reasoning && (
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex gap-3 mb-6">
          <Info className="w-5 h-5 text-blue-400 shrink-0" />
          <p className="text-sm text-zinc-400 italic">"{signal.reasoning}"</p>
        </div>
      )}

      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-yellow-500/50 shrink-0" />
        <p className="text-[9px] text-zinc-500 font-medium">
          Note: OTC মার্কেট অত্যন্ত ঝুঁকিপূর্ণ। সিগন্যাল আসার পর ১০-১৫ সেকেন্ড সময় পাবেন ট্রেড সেট করার জন্য। ক্যান্ডেল শুরু হওয়ার ঠিক ১ সেকেন্ড আগে বা শুরুতে এন্ট্রি নিন।
        </p>
      </div>
    </div>
  );
};

export default SignalDisplay;

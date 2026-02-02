
import React, { useState, useEffect, useCallback, useRef } from 'react';
import TradingHeader from './components/TradingHeader';
import SignalDisplay from './components/SignalDisplay';
import { MARKETS, TIMEFRAMES } from './constants';
import { Timeframe, Signal, Technicals, Candle } from './types';
import { marketService } from './services/marketData';
import { calculateTechnicals } from './services/analysisEngine';
import { getAISignal } from './services/geminiService';
import { LayoutGrid, RefreshCw, BarChart3, Globe, Zap } from 'lucide-react';

const App: React.FC = () => {
  const [isActive, setIsActive] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState(MARKETS[0].symbol);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1m');
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const [loading, setLoading] = useState(false);
  const [technicals, setTechnicals] = useState<Technicals | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  
  const marketRef = useRef(selectedMarket);
  const lastUpdateMin = useRef(-1);

  // Initialize and switch markets
  useEffect(() => {
    marketRef.current = selectedMarket;
    
    // Connect to either Real or Smart OTC Stream
    marketService.connectLiveStream(selectedMarket, (price) => {
      setLivePrice(price);
    });

    handleManualRetry();
  }, [selectedMarket, selectedTimeframe]);

  const updateSignal = useCallback(async () => {
    if (!isActive) return;
    setLoading(true);
    try {
      let history = selectedMarket.endsWith('_otc') 
        ? marketService.getSimulatedHistory(selectedMarket)
        : await marketService.fetchRealHistory(selectedMarket, selectedTimeframe);

      const stats = calculateTechnicals(history);
      setTechnicals(stats);

      const aiRes = await getAISignal(selectedMarket, selectedTimeframe, stats);
      setIsQuotaExhausted(aiRes.errorType === 'QUOTA_EXHAUSTED');
      
      const now = new Date();
      const seconds = now.getSeconds();
      const waitSeconds = 60 - seconds;
      
      const entryDate = new Date(now.getTime() + waitSeconds * 1000);
      const expiryDate = new Date(entryDate.getTime() + 60000);

      setCurrentSignal({
        market: selectedMarket,
        direction: (aiRes.direction as any) || 'WAIT',
        confidence: aiRes.confidence || 0,
        entryTime: entryDate.toLocaleTimeString('en-GB', { hour12: false }),
        expiryTime: expiryDate.toLocaleTimeString('en-GB', { hour12: false }),
        secondsRemaining: waitSeconds,
        timestamp: Date.now(),
        reasoning: aiRes.reasoning
      });
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [selectedMarket, selectedTimeframe, isActive]);

  // Lead-Time Controller: Trigger update at the 45th second
  useEffect(() => {
    const checker = setInterval(() => {
      const now = new Date();
      const sec = now.getSeconds();
      const min = now.getMinutes();
      
      if (sec === 45 && min !== lastUpdateMin.current && isActive) {
        lastUpdateMin.current = min;
        updateSignal();
      }
    }, 1000);
    return () => clearInterval(checker);
  }, [updateSignal, isActive]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSignal(prev => {
        if (!prev) return null;
        return { ...prev, secondsRemaining: Math.max(0, prev.secondsRemaining - 1) };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleManualRetry = () => { updateSignal(); };

  return (
    <div className="min-h-screen pb-12 bg-[#0a0a0b] text-zinc-100 selection:bg-blue-500/30">
      <TradingHeader isActive={isActive} setIsActive={setIsActive} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-blue-400" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">মার্কেট টার্মিনাল</h2>
                </div>
                {selectedMarket.endsWith('_otc') && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-500/10 rounded-md border border-blue-500/20">
                    <Zap className="w-3 h-3 text-blue-400 fill-current" />
                    <span className="text-[9px] font-black text-blue-400 uppercase">Live OTC Feed</span>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                <select 
                  value={selectedMarket}
                  onChange={(e) => setSelectedMarket(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-white font-bold outline-none ring-offset-2 ring-offset-zinc-900 focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  {MARKETS.map(m => <option key={m.symbol} value={m.symbol}>{m.name}</option>)}
                </select>
                {livePrice && (
                  <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                       <Globe className="w-12 h-12" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Live Price (Real-Time)</p>
                    <p className="text-3xl font-black mono text-blue-400 tabular-nums">
                      {selectedMarket.includes('USD') && !selectedMarket.includes('USDT') ? '' : '$'}
                      {livePrice.toFixed(selectedMarket.includes('JPY') || selectedMarket.includes('INR') || selectedMarket.includes('BDT') ? 3 : 5)}
                      {selectedMarket.includes('INR') ? ' ₹' : selectedMarket.includes('BDT') ? ' ৳' : ''}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2">
                  {TIMEFRAMES.map(tf => (
                    <button
                      key={tf.value}
                      onClick={() => setSelectedTimeframe(tf.value as Timeframe)}
                      className={`px-3 py-2.5 rounded-xl font-bold text-xs border transition-all ${selectedTimeframe === tf.value ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20' : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:bg-zinc-750'}`}
                    >
                      {tf.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">এনালাইটিক্স ইন্ডিকেটর</h2>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-tighter">Relative Strength (RSI)</span>
                  <span className={`text-xs font-black mono ${(technicals?.rsi || 50) > 70 ? 'text-red-400' : (technicals?.rsi || 50) < 30 ? 'text-green-400' : 'text-zinc-300'}`}>{technicals?.rsi.toFixed(2) || '---'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-zinc-800">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-tighter">Market Sentiment</span>
                  <span className={`text-xs font-black mono ${technicals?.trend === 'BULLISH' ? 'text-green-400' : 'text-red-400'}`}>{technicals?.trend || 'NEUTRAL'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs font-semibold text-zinc-500 uppercase tracking-tighter">Volatility Index</span>
                  <span className="text-xs font-black mono text-blue-400">{(technicals?.volatility.toFixed(2)) || '0.00'}</span>
                </div>
              </div>
            </section>
          </div>

          <div className="lg:col-span-8 space-y-6">
             <SignalDisplay 
               signal={currentSignal} 
               loading={loading} 
               timeframe={selectedTimeframe} 
               isQuotaExhausted={isQuotaExhausted}
               onRetry={handleManualRetry}
             />
             <div className="flex justify-center">
                <button onClick={handleManualRetry} disabled={loading} className="group flex items-center gap-3 px-10 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl text-sm font-black border border-zinc-700 transition-all active:scale-95">
                  <RefreshCw className={`w-5 h-5 text-blue-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                  ম্যানুয়াল রিফ্রেশ (Force Refresh)
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;

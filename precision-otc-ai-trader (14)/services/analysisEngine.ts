
import { Candle, Technicals } from '../types';

export const calculateTechnicals = (candles: Candle[]): Technicals => {
  if (candles.length < 26) {
    return { 
      rsi: 50, ema9: 0, ema21: 0, 
      macd: { value: 0, signal: 0, histogram: 0 },
      bb: { upper: 0, mid: 0, lower: 0 },
      momentum: 0, volatility: 0, trend: 'NEUTRAL' 
    };
  }

  const closes = candles.map(c => c.close);
  
  // EMA Helper
  const calculateEMA = (data: number[], period: number) => {
    const k = 2 / (period + 1);
    let ema = data[0];
    for (let i = 1; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    return ema;
  };

  // RSI 14
  let gains = 0;
  let losses = 0;
  for (let i = closes.length - 14; i < closes.length; i++) {
    const diff = closes[i] - (closes[i - 1] || closes[i]);
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const rs = gains / (losses || 1);
  const rsi = 100 - (100 / (1 + rs));

  // EMA 9 & 21
  const ema9 = calculateEMA(closes, 9);
  const ema21 = calculateEMA(closes, 21);

  // MACD (12, 26, 9)
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdValue = ema12 - ema26;
  const macdSignal = calculateEMA(closes.map((_, i) => {
    const sub = closes.slice(0, i + 1);
    return calculateEMA(sub, 12) - calculateEMA(sub, 26);
  }), 9);
  const macdHistogram = macdValue - macdSignal;

  // Bollinger Bands (20, 2)
  const period = 20;
  const slice = closes.slice(-period);
  const mid = slice.reduce((a, b) => a + b, 0) / period;
  const stdDev = Math.sqrt(slice.map(x => Math.pow(x - mid, 2)).reduce((a, b) => a + b, 0) / period);
  const bb = {
    upper: mid + (stdDev * 2),
    mid: mid,
    lower: mid - (stdDev * 2)
  };

  // Momentum
  const momentum = ((closes[closes.length - 1] - closes[closes.length - 5]) / (closes[closes.length - 5] || 1)) * 1000;

  // Volatility
  const last5 = candles.slice(-5);
  const avgRange = last5.reduce((acc, c) => acc + (c.high - c.low), 0) / 5;
  const volatility = (avgRange / (closes[closes.length - 1] || 1)) * 10000;

  // Trend detection
  const trend = (ema9 > ema21 && macdHistogram > 0) ? 'BULLISH' : (ema9 < ema21 && macdHistogram < 0) ? 'BEARISH' : 'NEUTRAL';

  return { rsi, ema9, ema21, macd: { value: macdValue, signal: macdSignal, histogram: macdHistogram }, bb, momentum, volatility, trend };
};

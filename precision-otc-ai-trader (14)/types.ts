
export type Timeframe = '5s' | '15s' | '30s' | '1m';

export interface Market {
  symbol: string;
  name: string;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Signal {
  direction: 'CALL' | 'PUT' | 'WAIT';
  confidence: number;
  entryTime: string;
  expiryTime: string;
  secondsRemaining: number;
  market: string;
  timestamp: number;
  reasoning?: string;
}

export interface Technicals {
  rsi: number;
  ema9: number;
  ema21: number;
  macd: {
    value: number;
    signal: number;
    histogram: number;
  };
  bb: {
    upper: number;
    mid: number;
    lower: number;
  };
  momentum: number;
  volatility: number;
  trend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

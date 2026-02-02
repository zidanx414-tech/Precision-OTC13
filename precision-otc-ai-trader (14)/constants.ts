
import { Market } from './types';

export const MARKETS: Market[] = [
  // Real Global Crypto
  { symbol: 'BTCUSDT', name: 'BTC/USDT (LIVE)' },
  { symbol: 'ETHUSDT', name: 'ETH/USDT (LIVE)' },
  
  // High Volatility OTC / Local Pairs
  { symbol: 'USDINR_otc', name: 'USD/INR OTC (HIGH)' },
  { symbol: 'USDBDT_otc', name: 'USD/BDT OTC (STABLE)' },
  { symbol: 'USDPKR_otc', name: 'USD/PKR OTC (VOLATILE)' },
  { symbol: 'USDBRL_otc', name: 'USD/BRL OTC (TREND)' },
  { symbol: 'EURUSD_otc', name: 'EUR/USD OTC (CORE)' },
  { symbol: 'GBPJPY_otc', name: 'GBP/JPY OTC (FAST)' }
];

export const TIMEFRAMES = [
  { value: '1m', label: '1 Minute' },
  { value: '3m', label: '3 Minutes' },
  { value: '5m', label: '5 Minutes' }
];

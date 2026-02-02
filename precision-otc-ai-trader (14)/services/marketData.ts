
import { Candle } from '../types';

export class MarketDataService {
  private socket: WebSocket | null = null;
  private otcInterval: number | null = null;

  public async fetchRealHistory(symbol: string, interval: string): Promise<Candle[]> {
    try {
      const bInterval = interval === '1m' ? '1m' : interval === '5m' ? '5m' : '1m';
      const response = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${bInterval}&limit=50`);
      const data = await response.json();
      
      return data.map((d: any) => ({
        time: d[0],
        open: parseFloat(d[1]),
        high: parseFloat(d[2]),
        low: parseFloat(d[3]),
        close: parseFloat(d[4]),
        volume: parseFloat(d[5])
      }));
    } catch (error) {
      console.error("Binance Fetch Error:", error);
      return [];
    }
  }

  public connectLiveStream(symbol: string, callback: (price: number) => void) {
    // Clear existing connections
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.otcInterval) {
      window.clearInterval(this.otcInterval);
      this.otcInterval = null;
    }

    if (!symbol.endsWith('_otc')) {
      // Real Binance Stream
      const streamSymbol = symbol.toLowerCase();
      this.socket = new WebSocket(`wss://stream.binance.com:9443/ws/${streamSymbol}@ticker`);
      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        callback(parseFloat(data.c));
      };
    } else {
      // Smart OTC Stream Simulator
      let currentPrice = this.getBasePrice(symbol);
      
      this.otcInterval = window.setInterval(() => {
        const volatility = currentPrice * 0.0001; // 0.01% volatility
        const change = (Math.random() - 0.5) * volatility;
        currentPrice += change;
        callback(currentPrice);
      }, 1000); // Update every 1 second
    }
  }

  private getBasePrice(symbol: string): number {
    if (symbol.includes('INR')) return 83.4820;
    if (symbol.includes('BDT')) return 117.4530;
    if (symbol.includes('PKR')) return 278.2500;
    if (symbol.includes('BRL')) return 5.2410;
    if (symbol.includes('JPY')) return 156.7800;
    return 1.0845; // Default for EUR/USD
  }

  public getSimulatedHistory(symbol: string): Candle[] {
    const history: Candle[] = [];
    let currentPrice = this.getBasePrice(symbol);
    const now = Date.now();
    
    for (let i = 0; i < 50; i++) {
      const volatility = currentPrice * 0.0005;
      const change = (Math.random() - 0.5) * volatility;
      const open = currentPrice;
      const close = currentPrice + change;
      history.push({
        time: now - (50 - i) * 60000,
        open,
        high: Math.max(open, close) + volatility * 0.2,
        low: Math.min(open, close) - volatility * 0.2,
        close,
        volume: Math.random() * 1000
      });
      currentPrice = close;
    }
    return history;
  }
}

export const marketService = new MarketDataService();

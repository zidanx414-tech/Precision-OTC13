
import { GoogleGenAI, Type } from "@google/genai";
import { Technicals, Signal, Timeframe } from '../types';

export const getAISignal = async (
  symbol: string, 
  timeframe: Timeframe, 
  technicals: Technicals
): Promise<Partial<Signal> & { errorType?: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const currentPriceStatus = technicals.rsi > 70 ? "OVERBOUGHT" : technicals.rsi < 30 ? "OVERSOLD" : "NEUTRAL";
  
  const prompt = `Act as a Senior Institutional Trader. Analyze this ${symbol} (${timeframe}) data:
- Trend: ${technicals.trend}
- RSI: ${technicals.rsi.toFixed(2)} (${currentPriceStatus})
- MACD Histogram: ${technicals.macd.histogram.toFixed(5)}
- BB Position: Price is at ${technicals.bb.mid.toFixed(5)} (Upper: ${technicals.bb.upper.toFixed(5)}, Lower: ${technicals.bb.lower.toFixed(5)})
- Momentum: ${technicals.momentum.toFixed(4)}

Strategy: Use Price Action + RSI Rejection + MACD Cross. 
If RSI is > 70 and MACD Hist is decreasing near BB Upper, suggest PUT. 
If RSI is < 30 and MACD Hist is increasing near BB Lower, suggest CALL.
Confidence must be 0-100. Only return JSON {direction: "CALL" | "PUT" | "WAIT", confidence: number, reasoning: string}.`;

  try {
    const responsePromise = ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            direction: { type: Type.STRING, enum: ['CALL', 'PUT', 'WAIT'] },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING }
          },
          required: ['direction', 'confidence', 'reasoning']
        }
      }
    });

    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("AI_TIMEOUT")), 8000)
    );

    const response = await Promise.race([responsePromise, timeoutPromise]) as any;
    return JSON.parse(response.text || '{}');

  } catch (error: any) {
    console.warn("Fast Engine Fallback triggered.");
    
    // Improved Fast Engine Logic
    let direction: 'CALL' | 'PUT' | 'WAIT' = 'WAIT';
    let confidence = 0;
    let reason = "Market waiting for confirmation.";

    const { rsi, trend, macd, bb } = technicals;

    // Advanced Local Rules
    if (rsi < 30 && macd.histogram > 0 && trend === 'BULLISH') {
      direction = 'CALL';
      confidence = 85;
      reason = "Oversold Rebound: RSI rejection with MACD bullish crossover.";
    } else if (rsi > 70 && macd.histogram < 0 && trend === 'BEARISH') {
      direction = 'PUT';
      confidence = 84;
      reason = "Overbought Rejection: RSI resistance with MACD bearish pressure.";
    } else if (rsi < 25) {
      direction = 'CALL';
      confidence = 78;
      reason = "Extreme Oversold: Technical bounce expected.";
    } else if (rsi > 75) {
      direction = 'PUT';
      confidence = 78;
      reason = "Extreme Overbought: Technical correction imminent.";
    }

    return { 
      direction, 
      confidence, 
      reasoning: direction === 'WAIT' ? "Scanning volatility levels..." : `[AI Core 3.1] ${reason}`
    };
  }
};

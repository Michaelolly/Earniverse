
import { supabase } from "@/integrations/supabase/client";

export interface BitgetTicker {
  symbol: string;
  high24h: string;
  low24h: string;
  lastPr: string;
  askPr: string;
  bidPr: string;
  baseVolume: string;
  quoteVolume: string;
  ts: number;
  usdtVolume: string;
  openUtc: string;
  chgUtc: string;
  bidSz: string;
  askSz: string;
}

export interface BitgetHistoricalData {
  time: string;
  price: number;
}

export const fetchBitgetTicker = async (symbol: string): Promise<BitgetTicker | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('bitget-market-data', {
      body: { symbol: symbol },
    });

    if (error) {
      console.error('Error fetching Bitget market data:', error);
      return null;
    }
    
    if (data?.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error in Bitget API call:', error);
    return null;
  }
};

export const generateMockHistoricalData = (
  basePrice: number,
  points: number = 24,
  volatility: number = 0.05
): BitgetHistoricalData[] => {
  const result: BitgetHistoricalData[] = [];
  let currentPrice = basePrice;
  
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    // Create a time point going back i hours
    const timePoint = new Date(now);
    timePoint.setHours(now.getHours() - i);
    
    // Random price movement within volatility percentage
    const change = currentPrice * (Math.random() * volatility * 2 - volatility);
    currentPrice = currentPrice + change;
    
    result.push({
      time: timePoint.toISOString(),
      price: currentPrice,
    });
  }
  
  return result;
};

export const formatCryptoName = (symbol: string): string => {
  // Remove USD/USDT suffix
  const base = symbol.replace(/USD.*$/, '');
  
  // Map of common crypto symbols to their full names
  const cryptoNames: Record<string, string> = {
    'BTC': 'Bitcoin',
    'ETH': 'Ethereum',
    'SOL': 'Solana',
    'BNB': 'Binance Coin',
    'ADA': 'Cardano',
    'XRP': 'Ripple',
    'DOT': 'Polkadot',
    'DOGE': 'Dogecoin',
    'AVAX': 'Avalanche',
    'MATIC': 'Polygon',
    'LINK': 'Chainlink',
    'UNI': 'Uniswap',
    'ATOM': 'Cosmos',
    'LTC': 'Litecoin',
  };
  
  return cryptoNames[base] || base;
};

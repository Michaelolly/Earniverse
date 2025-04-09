
import { supabase } from "@/integrations/supabase/client";

export interface CoinMarketCapTicker {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
      volume_24h: number;
      market_cap: number;
      last_updated: string;
    }
  }
}

export interface BitgetHistoricalData {
  time: string;
  price: number;
}

export interface CryptoAssetData {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
  sparkline_data: BitgetHistoricalData[];
}

export const fetchCryptoData = async (symbol: string): Promise<CoinMarketCapTicker | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('coinmarketcap-data', {
      body: { symbol: symbol },
    });

    if (error) {
      console.error('Error fetching CoinMarketCap data:', error);
      return null;
    }
    
    if (data?.data) {
      return data.data;
    }
    
    return null;
  } catch (error) {
    console.error('Error in CoinMarketCap API call:', error);
    return null;
  }
};

export const fetchCryptoHistorical = async (symbol: string): Promise<BitgetHistoricalData[] | null> => {
  try {
    const { data, error } = await supabase.functions.invoke('coinmarketcap-historical', {
      body: { symbol: symbol },
    });

    if (error) {
      console.error('Error fetching CoinMarketCap historical data:', error);
      return null;
    }
    
    if (data?.data) {
      return data.data;
    }
    
    // If API fails, return mock data
    return generateMockHistoricalData(1000);
  } catch (error) {
    console.error('Error in CoinMarketCap historical API call:', error);
    // Return mock data as fallback
    return generateMockHistoricalData(1000);
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

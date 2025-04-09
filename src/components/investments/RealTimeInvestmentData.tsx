import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { investmentConfig } from "@/integrations/flutterwave/config";
import { Loader2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fetchBitgetTicker, generateMockHistoricalData, formatCryptoName, BitgetTicker, CryptoAssetData } from "@/services/bitgetService";

// Define crypto symbols to track
const CRYPTO_SYMBOLS: Record<string, { id: string; symbol: string }> = {
  "BTCUSDT": { id: "bitcoin", symbol: "BTC" },
  "ETHUSDT": { id: "ethereum", symbol: "ETH" },
  "SOLUSDT": { id: "solana", symbol: "SOL" },
  "ADAUSDT": { id: "cardano", symbol: "ADA" }
};

// Define sample stock data
const SAMPLE_STOCK_DATA: Record<string, any> = {
  "AAPL": {
    symbol: "AAPL",
    name: "Apple Inc.",
    current_price: 174.23,
    price_change_percentage_24h: 0.87,
    sparkline_data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: 172 + Math.random() * 5
    }))
  },
  "MSFT": {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    current_price: 415.56,
    price_change_percentage_24h: 1.24,
    sparkline_data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: 410 + Math.random() * 10
    }))
  },
  "GOOGL": {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    current_price: 164.87,
    price_change_percentage_24h: -0.32,
    sparkline_data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: 163 + Math.random() * 4
    }))
  },
  "AMZN": {
    symbol: "AMZN",
    name: "Amazon.com, Inc.",
    current_price: 183.91,
    price_change_percentage_24h: 0.45,
    sparkline_data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: 182 + Math.random() * 4
    }))
  }
};

const RealTimeInvestmentData = () => {
  const [activeTab, setActiveTab] = useState("crypto");
  const [cryptoData, setCryptoData] = useState<Record<string, CryptoAssetData>>({});
  const [stockData, setStockData] = useState<any>(SAMPLE_STOCK_DATA);
  const [selectedAsset, setSelectedAsset] = useState<string>("");
  const [loading, setLoading] = useState(true);
  
  // Function to fetch real-time crypto data from Bitget
  const fetchCryptoData = useCallback(async () => {
    setLoading(true);
    
    try {
      const cryptoEntries = await Promise.all(
        Object.entries(CRYPTO_SYMBOLS).map(async ([symbol, info]) => {
          const ticker = await fetchBitgetTicker(symbol);
          
          if (ticker) {
            const currentPrice = parseFloat(ticker.lastPr);
            const openPrice = parseFloat(ticker.openUtc);
            const priceChangePercentage = ((currentPrice - openPrice) / openPrice) * 100;
            
            const assetData: CryptoAssetData = {
              id: info.id,
              name: formatCryptoName(symbol),
              symbol: info.symbol,
              current_price: currentPrice,
              price_change_percentage_24h: priceChangePercentage,
              sparkline_data: generateMockHistoricalData(currentPrice, 24, 0.05)
            };
            
            return [symbol, assetData] as [string, CryptoAssetData];
          }
          
          return null;
        })
      );
      
      const newCryptoData: Record<string, CryptoAssetData> = {};
      cryptoEntries.filter(Boolean).forEach(entry => {
        if (entry) {
          const [symbol, data] = entry;
          newCryptoData[symbol] = data;
        }
      });
      
      // Default selection if none exists
      if (Object.keys(newCryptoData).length > 0 && !selectedAsset) {
        setSelectedAsset(Object.keys(newCryptoData)[0]);
      }
      
      setCryptoData(newCryptoData);
    } catch (error) {
      console.error("Error fetching crypto data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedAsset]);
  
  // Initial data fetch
  useEffect(() => {
    fetchCryptoData();
    
    // Set up auto-refresh for crypto data
    const refreshInterval = setInterval(() => {
      if (activeTab === "crypto") {
        fetchCryptoData();
      }
    }, investmentConfig.cryptoRefreshInterval);
    
    return () => clearInterval(refreshInterval);
  }, [fetchCryptoData, activeTab]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "crypto") {
      if (Object.keys(cryptoData).length > 0) {
        setSelectedAsset(Object.keys(cryptoData)[0]);
      }
    } else {
      setSelectedAsset(Object.keys(stockData)[0]);
    }
  };
  
  // Get current asset data based on active tab and selected asset
  const currentData = activeTab === "crypto" ? cryptoData : stockData;
  const selectedAssetData = selectedAsset ? currentData[selectedAsset] : null;
  
  const manualRefresh = () => {
    if (activeTab === "crypto") {
      fetchCryptoData();
    } else {
      setLoading(true);
      setTimeout(() => {
        const updatedData = { ...stockData };
        Object.keys(updatedData).forEach(key => {
          updatedData[key].current_price = updatedData[key].current_price * (1 + (Math.random() * 0.02 - 0.01));
          updatedData[key].price_change_percentage_24h += (Math.random() * 0.3 - 0.15);
          updatedData[key].sparkline_data = [...updatedData[key].sparkline_data.slice(1), { 
            time: 'now', 
            price: updatedData[key].current_price 
          }];
        });
        setStockData(updatedData);
        setLoading(false);
      }, 800);
    }
  };

  // Format date for chart tooltip
  const formatTooltipDate = (time: string) => {
    if (time === 'now') return 'Now';
    
    try {
      if (time.includes('h')) {
        return time; // Already formatted as "0h", "1h", etc.
      }
      
      const date = new Date(time);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return time;
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Real-Time Market Data</CardTitle>
            <CardDescription>
              Live prices and performance tracking
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={manualRefresh} 
            disabled={loading}
            className="gap-1"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="crypto" onValueChange={handleTabChange}>
          <TabsList className="mb-4 grid grid-cols-2 w-48">
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="crypto" className="space-y-4">
            {loading && Object.keys(cryptoData).length === 0 ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(cryptoData).map(([id, asset]) => (
                    <Button 
                      key={id}
                      variant={selectedAsset === id ? "default" : "outline"}
                      className="justify-start h-auto py-2"
                      onClick={() => setSelectedAsset(id)}
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{asset.symbol}</span>
                          <span className={`text-xs ${asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {asset.price_change_percentage_24h >= 0 ? '+' : ''}{asset.price_change_percentage_24h.toFixed(2)}%
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">{asset.name}</div>
                      </div>
                    </Button>
                  ))}
                </div>
                
                {selectedAssetData && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold">{selectedAssetData.name} ({selectedAssetData.symbol})</h3>
                        <p className="text-2xl font-bold">${selectedAssetData.current_price.toFixed(2)}</p>
                      </div>
                      <div className={`flex items-center ${selectedAssetData.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedAssetData.price_change_percentage_24h >= 0 ? (
                          <TrendingUp className="mr-1" />
                        ) : (
                          <TrendingDown className="mr-1" />
                        )}
                        <span className="font-semibold">
                          {selectedAssetData.price_change_percentage_24h >= 0 ? '+' : ''}
                          {selectedAssetData.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={selectedAssetData.sparkline_data}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="time" 
                            tickFormatter={formatTooltipDate}
                          />
                          <YAxis 
                            domain={['auto', 'auto']} 
                            tickFormatter={(value) => `$${value.toFixed(2)}`}
                          />
                          <Tooltip 
                            formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Price']} 
                            labelFormatter={formatTooltipDate}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="price" 
                            stroke={selectedAssetData.price_change_percentage_24h >= 0 ? "#16a34a" : "#dc2626"} 
                            strokeWidth={2} 
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="stocks" className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(stockData).map(([symbol, asset]) => (
                <Button 
                  key={symbol}
                  variant={selectedAsset === symbol ? "default" : "outline"}
                  className="justify-start h-auto py-2"
                  onClick={() => setSelectedAsset(symbol)}
                >
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{symbol}</span>
                      <span className={`text-xs ${asset.price_change_percentage_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {asset.price_change_percentage_24h >= 0 ? '+' : ''}{asset.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground truncate">{asset.name}</div>
                  </div>
                </Button>
              ))}
            </div>
            
            {selectedAssetData && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedAssetData.name} ({selectedAssetData.symbol})</h3>
                    <p className="text-2xl font-bold">${selectedAssetData.current_price.toFixed(2)}</p>
                  </div>
                  <div className={`flex items-center ${selectedAssetData.price_change_percentage_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedAssetData.price_change_percentage_24h >= 0 ? (
                      <TrendingUp className="mr-1" />
                    ) : (
                      <TrendingDown className="mr-1" />
                    )}
                    <span className="font-semibold">
                      {selectedAssetData.price_change_percentage_24h >= 0 ? '+' : ''}
                      {selectedAssetData.price_change_percentage_24h.toFixed(2)}%
                    </span>
                  </div>
                </div>
                
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedAssetData.sparkline_data}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis 
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `$${value.toFixed(2)}`} 
                      />
                      <Tooltip 
                        formatter={(value: any) => [`$${parseFloat(value).toFixed(2)}`, 'Price']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke={selectedAssetData.price_change_percentage_24h >= 0 ? "#16a34a" : "#dc2626"} 
                        strokeWidth={2} 
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RealTimeInvestmentData;


import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { investmentConfig } from "@/integrations/flutterwave/config";
import { Loader2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Define sample crypto data (in a real app, this would come from an API)
const SAMPLE_CRYPTO_DATA = {
  "bitcoin": {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    current_price: 65832.21,
    price_change_percentage_24h: 2.45,
    sparkline_data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: 64000 + Math.random() * 4000
    }))
  },
  "ethereum": {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    current_price: 3482.76,
    price_change_percentage_24h: 1.87,
    sparkline_data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: 3300 + Math.random() * 400
    }))
  },
  "solana": {
    id: "solana",
    name: "Solana",
    symbol: "SOL",
    current_price: 148.32,
    price_change_percentage_24h: -0.54,
    sparkline_data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: 145 + Math.random() * 10
    }))
  },
  "cardano": {
    id: "cardano",
    name: "Cardano",
    symbol: "ADA",
    current_price: 0.45,
    price_change_percentage_24h: 0.21,
    sparkline_data: Array.from({ length: 24 }, (_, i) => ({
      time: `${i}h`,
      price: 0.44 + Math.random() * 0.03
    }))
  }
};

// Define sample stock data
const SAMPLE_STOCK_DATA = {
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
  const [cryptoData, setCryptoData] = useState<any>(SAMPLE_CRYPTO_DATA);
  const [stockData, setStockData] = useState<any>(SAMPLE_STOCK_DATA);
  const [selectedAsset, setSelectedAsset] = useState<string>(Object.keys(SAMPLE_CRYPTO_DATA)[0]);
  const [loading, setLoading] = useState(false);
  
  // In a real implementation, these would come from API calls
  useEffect(() => {
    // Simulated data refresh
    const refreshData = () => {
      // In a real app, this would be an API call to get the latest data
      setLoading(true);
      
      setTimeout(() => {
        // Simulate updated data with slight variations
        const updatedCryptoData = Object.entries(cryptoData).reduce((acc, [key, value]: [string, any]) => {
          const priceChange = (Math.random() * 2 - 1) * value.current_price * 0.01; // ±1% change
          const newPrice = value.current_price + priceChange;
          const newPercentageChange = value.price_change_percentage_24h + (Math.random() * 0.4 - 0.2);
          
          // Update sparkline data with new price point
          const newSparkline = [...value.sparkline_data.slice(1), { 
            time: `now`, 
            price: newPrice 
          }];
          
          acc[key] = {
            ...value,
            current_price: newPrice,
            price_change_percentage_24h: newPercentageChange,
            sparkline_data: newSparkline
          };
          return acc;
        }, {} as any);
        
        const updatedStockData = Object.entries(stockData).reduce((acc, [key, value]: [string, any]) => {
          const priceChange = (Math.random() * 2 - 1) * value.current_price * 0.005; // ±0.5% change
          const newPrice = value.current_price + priceChange;
          const newPercentageChange = value.price_change_percentage_24h + (Math.random() * 0.2 - 0.1);
          
          // Update sparkline data with new price point
          const newSparkline = [...value.sparkline_data.slice(1), { 
            time: `now`, 
            price: newPrice 
          }];
          
          acc[key] = {
            ...value,
            current_price: newPrice,
            price_change_percentage_24h: newPercentageChange,
            sparkline_data: newSparkline
          };
          return acc;
        }, {} as any);
        
        setCryptoData(updatedCryptoData);
        setStockData(updatedStockData);
        setLoading(false);
      }, 800); // Simulate API delay
    };
    
    // Initial refresh
    refreshData();
    
    // Set up refresh intervals
    const cryptoInterval = setInterval(() => {
      if (activeTab === "crypto") refreshData();
    }, investmentConfig.cryptoRefreshInterval);
    
    const stockInterval = setInterval(() => {
      if (activeTab === "stocks") refreshData();
    }, investmentConfig.stockRefreshInterval);
    
    return () => {
      clearInterval(cryptoInterval);
      clearInterval(stockInterval);
    };
  }, [activeTab]);
  
  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "crypto") {
      setSelectedAsset(Object.keys(cryptoData)[0]);
    } else {
      setSelectedAsset(Object.keys(stockData)[0]);
    }
  };
  
  // Get current asset data based on active tab and selected asset
  const currentData = activeTab === "crypto" ? cryptoData : stockData;
  const selectedAssetData = currentData[selectedAsset];
  
  const manualRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      // Similar to the effect, but triggered manually
      if (activeTab === "crypto") {
        const updatedData = { ...cryptoData };
        Object.keys(updatedData).forEach(key => {
          updatedData[key].current_price = updatedData[key].current_price * (1 + (Math.random() * 0.04 - 0.02));
          updatedData[key].price_change_percentage_24h += (Math.random() * 0.6 - 0.3);
          updatedData[key].sparkline_data = [...updatedData[key].sparkline_data.slice(1), { 
            time: 'now', 
            price: updatedData[key].current_price 
          }];
        });
        setCryptoData(updatedData);
      } else {
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
      }
      setLoading(false);
    }, 800);
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
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(cryptoData).map(([id, asset]: [string, any]) => (
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
                      <XAxis dataKey="time" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
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
          
          <TabsContent value="stocks" className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(stockData).map(([symbol, asset]: [string, any]) => (
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
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
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

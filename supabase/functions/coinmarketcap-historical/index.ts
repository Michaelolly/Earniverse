
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    
    // Validate input
    if (!symbol) {
      throw new Error("Symbol is required");
    }

    // CoinMarketCap API credentials
    const apiKey = Deno.env.get("COINMARKETCAP_API_KEY");

    if (!apiKey) {
      throw new Error("CoinMarketCap API key not configured");
    }

    // Extract just the token part (remove USDT suffix)
    const baseSymbol = symbol.replace(/USDT$/, '');

    // For CoinMarketCap, we need to get the ID first
    const idResponse = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?symbol=${baseSymbol}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
          "Accept": "application/json",
        },
      }
    );

    const idData = await idResponse.json();
    
    if (idData.status?.error_code !== 0 || !idData.data || !idData.data[0]) {
      throw new Error("Could not find cryptocurrency ID");
    }

    const id = idData.data[0].id;

    // Now fetch historical data using the ID
    // Note: The free tier of CoinMarketCap API doesn't provide historical data,
    // so we'll simulate it with the quotes endpoint and some transformation
    const quoteResponse = await fetch(
      `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${id}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
          "Accept": "application/json",
        },
      }
    );

    const quoteData = await quoteResponse.json();
    
    if (quoteData.status?.error_code !== 0 || !quoteData.data || !quoteData.data[id]) {
      throw new Error("Could not fetch price quotes");
    }
    
    // Since historical data is limited in the free tier, we'll generate a simulated dataset
    // based on the current price
    const currentPrice = quoteData.data[id].quote.USD.price;
    const historicalData = [];
    
    // Generate 24 hours of data
    for (let i = 24; i >= 0; i--) {
      const timePoint = new Date();
      timePoint.setHours(timePoint.getHours() - i);
      
      // Add some random variation to the price
      const variance = Math.random() * 0.05 - 0.025; // +/- 2.5%
      const price = currentPrice * (1 + variance);
      
      historicalData.push({
        time: timePoint.toISOString(),
        price: price
      });
    }

    // Return response with CORS headers
    return new Response(JSON.stringify({ data: historicalData }), {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "application/json" 
      },
    });
  } catch (error) {
    console.error("Error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});

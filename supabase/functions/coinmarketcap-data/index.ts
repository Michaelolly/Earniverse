
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

    // Fetch data from CoinMarketCap API
    const response = await fetch(
      `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${baseSymbol}`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": apiKey,
          "Accept": "application/json",
        },
      }
    );

    const responseData = await response.json();
    
    // Format the response to match our expected format
    let formattedData = null;
    
    if (responseData.status?.error_code === 0 && responseData.data && responseData.data[baseSymbol]) {
      formattedData = responseData.data[baseSymbol];
    }

    // Return response with CORS headers
    return new Response(JSON.stringify({ data: formattedData }), {
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

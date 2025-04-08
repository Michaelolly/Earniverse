
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as crypto from "https://deno.land/std/crypto/mod.ts";

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

    // Bitget API credentials
    const apiKey = Deno.env.get("BITGET_API_KEY");
    const secretKey = Deno.env.get("BITGET_SECRET_KEY");

    if (!apiKey || !secretKey) {
      throw new Error("Bitget API credentials not configured");
    }

    // Request parameters
    const endpoint = "/api/spot/v1/market/ticker";
    const params = `symbol=${symbol}`;
    const timestamp = Date.now().toString();
    const method = "GET";
    const requestPath = `${endpoint}?${params}`;

    // Generate signature
    const signString = timestamp + method + requestPath;
    const encoder = new TextEncoder();
    const secretKeyData = encoder.encode(secretKey);
    const signatureData = encoder.encode(signString);
    
    const key = await crypto.subtle.importKey(
      "raw",
      secretKeyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      signatureData
    );
    
    // Convert signature to base64
    const signatureBase64 = btoa(
      String.fromCharCode(...new Uint8Array(signature))
    );

    // Fetch data from Bitget API
    const response = await fetch(
      `https://api.bitget.com${requestPath}`,
      {
        method: method,
        headers: {
          "ACCESS-KEY": apiKey,
          "ACCESS-SIGN": signatureBase64,
          "ACCESS-TIMESTAMP": timestamp,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    // Return response with CORS headers
    return new Response(JSON.stringify(data), {
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

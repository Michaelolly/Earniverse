
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { user_id } = await req.json();
    
    if (!user_id) {
      throw new Error("Missing required parameter: user_id");
    }

    // Get current balance
    const { data: balanceData, error: balanceError } = await supabaseClient
      .from("user_balances")
      .select("balance")
      .eq("user_id", user_id)
      .single();
    
    if (balanceError && balanceError.code !== 'PGRST116') {
      throw new Error(`Failed to fetch balance: ${balanceError.message}`);
    }

    const currentBalance = balanceData?.balance || 0;
    
    console.log(`User ${user_id} current balance: $${currentBalance}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        balance: currentBalance 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400
      }
    );
  }
});

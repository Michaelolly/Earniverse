
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

    const { p_user_id, p_amount, p_game_session_id, p_transaction_type, p_description } = await req.json();

    // Get current balance
    const { data: balanceData, error: balanceError } = await supabaseClient
      .from("user_balances")
      .select("balance")
      .eq("user_id", p_user_id)
      .single();
    
    if (balanceError) {
      throw new Error(`Failed to fetch balance: ${balanceError.message}`);
    }

    const newBalance = balanceData.balance + p_amount;

    // Start a transaction to update balance and create a transaction record
    // 1. Update user balance
    const { error: updateBalanceError } = await supabaseClient
      .from("user_balances")
      .update({ balance: newBalance })
      .eq("user_id", p_user_id);
    
    if (updateBalanceError) {
      throw new Error(`Failed to update balance: ${updateBalanceError.message}`);
    }

    // 2. Create transaction record
    const { error: transactionError } = await supabaseClient
      .from("transactions")
      .insert({
        user_id: p_user_id,
        amount: p_amount,
        type: p_transaction_type,
        reference_id: p_game_session_id,
        description: p_description
      });
    
    if (transactionError) {
      throw new Error(`Failed to create transaction record: ${transactionError.message}`);
    }

    // 3. Update totals based on win/loss
    if (p_amount > 0) {
      // Update total winnings
      await supabaseClient
        .from("user_balances")
        .update({ 
          total_winnings: supabaseClient.rpc('get_coalesce_sum', { val: 'total_winnings', user_id: p_user_id, amount: p_amount })
        })
        .eq("user_id", p_user_id);
    } else if (p_amount < 0) {
      // Update total losses (store as positive number)
      await supabaseClient
        .from("user_balances")
        .update({ 
          total_losses: supabaseClient.rpc('get_coalesce_sum', { val: 'total_losses', user_id: p_user_id, amount: Math.abs(p_amount) })
        })
        .eq("user_id", p_user_id);
    }

    return new Response(
      JSON.stringify({ success: true, new_balance: newBalance }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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

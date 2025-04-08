
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.6.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // To ensure security, this endpoint should only be accessible from Stripe
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response(JSON.stringify({ error: "No signature provided" }), { 
      status: 400, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  try {
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Parse the webhook payload
    const body = await req.text();
    
    // Verify the webhook signature
    // Note: In production, use a proper webhook secret
    const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") || "";
    let event;
    
    try {
      if (endpointSecret) {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      } else {
        // Fallback without signature verification if webhook secret is not set
        event = JSON.parse(body);
      }
    } catch (err) {
      console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
      return new Response(JSON.stringify({ error: "Invalid signature" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Handle the checkout.session.completed event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      
      // Connect to Supabase
      const supabaseClient = createClient(
        Deno.env.get("SUPABASE_URL") || "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
      );

      const userId = session.client_reference_id || session.metadata?.user_id;
      if (!userId) {
        throw new Error("No user ID found in session");
      }

      const depositAmount = parseFloat(session.metadata?.amount || "0");
      if (depositAmount <= 0) {
        throw new Error("Invalid deposit amount");
      }

      console.log(`Processing deposit of $${depositAmount} for user ${userId}`);

      // Get current user balance
      const { data: balanceData, error: balanceError } = await supabaseClient
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (balanceError && balanceError.code !== 'PGRST116') {
        throw new Error(`Error fetching balance: ${balanceError.message}`);
      }

      const currentBalance = balanceData?.balance || 0;
      const newBalance = currentBalance + depositAmount;

      console.log(`Current balance: $${currentBalance}, New balance: $${newBalance}`);

      // Check if user balance record exists
      if (!balanceData) {
        // Create new balance record
        const { error: insertError } = await supabaseClient
          .from('user_balances')
          .insert({
            user_id: userId,
            balance: depositAmount,
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          throw new Error(`Error creating balance record: ${insertError.message}`);
        }
      } else {
        // Update existing balance
        const { error: updateError } = await supabaseClient
          .from('user_balances')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          throw new Error(`Error updating balance: ${updateError.message}`);
        }
      }

      // Create transaction record
      const { error: transactionError } = await supabaseClient
        .from('transactions')
        .insert({
          user_id: userId,
          amount: depositAmount,
          type: 'deposit',
          description: `Stripe payment - Ref: ${session.payment_intent || session.id}`,
          created_at: new Date().toISOString()
        });

      if (transactionError) {
        throw new Error(`Error creating transaction: ${transactionError.message}`);
      }

      console.log(`Deposit successfully processed for user ${userId}`);
    }

    // Return a success response
    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`Error processing webhook: ${error.message}`);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

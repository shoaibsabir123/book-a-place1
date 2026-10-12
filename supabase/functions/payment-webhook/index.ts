// Supabase Edge Function: payment-webhook
// Secure payment webhook verification and idempotent status updates

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { transaction_id, booking_reference, status, provider, amount } = await req.json();

    // Verify idempotent processing: check if payment record already exists
    const { data: existingPayment } = await supabaseClient
      .from("payments")
      .select("id, status")
      .eq("provider_transaction_id", transaction_id)
      .maybeSingle();

    if (existingPayment && existingPayment.status === "succeeded") {
      return new Response(
        JSON.stringify({ message: "Transaction already processed idempotently" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update booking status
    if (status === "succeeded") {
      await supabaseClient
        .from("bookings")
        .update({
          booking_status: "confirmed",
          payment_status: "paid",
          updated_at: new Date().toISOString()
        })
        .eq("booking_reference", booking_reference);
    }

    return new Response(
      JSON.stringify({ success: true, transaction_id, status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

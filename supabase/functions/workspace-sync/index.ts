// Supabase Edge Function: workspace-sync
// Synchronizes booking data to Google Sheets & Generates Google Docs itineraries

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, booking_data } = await req.json();

    if (action === "sheets_export") {
      // Formats booking rows for Google Sheets export
      const rows = [
        ["Reference", "Guest Name", "Property", "City", "Check In", "Check Out", "Total (PKR)", "Status"],
        [
          booking_data.reference,
          booking_data.guest_name,
          booking_data.property_title,
          booking_data.city,
          booking_data.check_in,
          booking_data.check_out,
          booking_data.total,
          booking_data.status
        ]
      ];
      return new Response(JSON.stringify({ success: true, exported_rows: rows }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (action === "docs_itinerary") {
      const docContent = `
BOOK A PLACE - OFFICIAL RESERVATION ITINERARY
Reference: ${booking_data.reference}
==============================================
Guest: ${booking_data.guest_name}
Property: ${booking_data.property_title}
Location: ${booking_data.address}, ${booking_data.city}, Pakistan
Check-in: ${booking_data.check_in} (After 14:00 PKT)
Check-out: ${booking_data.check_out} (Before 11:00 PKT)
Guests: ${booking_data.guests}
Total Paid: PKR ${Number(booking_data.total).toLocaleString()}
Contact: ${booking_data.phone || '+92 51 111 266 575'}
      `.trim();

      return new Response(JSON.stringify({ success: true, doc_text: docContent }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ error: "Unsupported action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

// Supabase Edge Function: gemini-recommendations
// Uses Google Gemini API to analyze traveler requirements and recommend stays in Pakistan

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
    const { prompt, destination, budget, guests, stayType } = await req.json();
    const apiKey = Deno.env.get("GEMINI_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const systemPrompt = `You are the AI Stay Specialist for "Book a Place", Pakistan's premier accommodation platform.
Recommend authentic Pakistani accommodations matching the user's budget in PKR, city preferences (e.g., Islamabad, Lahore, Karachi, Murree, Hunza, Skardu), and travel style (Student, Professional, Family, Backpacker).
Provide a structured JSON response with:
- summary: brief conversational overview
- recommended_locations: neighborhoods with proximity reasons
- budget_breakdown: estimated nightly, weekly or monthly cost in PKR
- suggestions: list of accommodation recommendations with features
- travel_tips: local tips for Pakistan (safety, transit, seasons)`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`;

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          role: "user",
          parts: [{ text: `${systemPrompt}\n\nUser Request: ${prompt}\nDestination: ${destination || "Any in Pakistan"}\nBudget: ${budget || "Flexible"} PKR\nGuests: ${guests || 1}\nStay Type: ${stayType || "General"}` }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    const result = await response.json();
    const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsedData = candidateText ? JSON.parse(candidateText) : { summary: "No recommendation available" };

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

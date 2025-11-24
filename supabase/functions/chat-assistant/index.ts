import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    const { messages } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are CityServe Assistant, an AI helper for a civic complaint management portal.

IMPORTANT CONTEXT:
- This is a complaint portal for citizens to report civic issues like roads, water supply, electricity, sanitation, and parks
- Citizens can submit complaints, track status, upload photos, and view complaint history
- Departments can manage and resolve complaints
- Admins can oversee all operations and analytics

CAPABILITIES:
1. Filing Complaints: Guide users on how to submit complaints with location, photos, and descriptions
2. Tracking: Help users track complaint status (New, In Progress, Resolved, Closed)
3. Departments: Explain how complaints are assigned to relevant departments (Public Works, Sanitation, Water Supply, Electricity, Parks)
4. Authentication: Assist with login/signup, including Google sign-in
5. Features: Explain maps, analytics, priority levels, and real-time updates

GUIDELINES:
- Be helpful, concise, and friendly
- Keep responses under 3-4 sentences unless detailed explanation is needed
- Always stay within the context of civic complaint management

Answer user queries related to this complaint portal system.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to continue using AI." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

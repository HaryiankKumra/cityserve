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
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

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

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt }] },
            ...messages.map((msg: any) => ({
              role: msg.role === "assistant" ? "model" : "user",
              parts: [{ text: msg.content }]
            }))
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

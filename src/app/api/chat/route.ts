import { NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"
import { z } from "zod"
import { chatRateLimiter } from "@/lib/rateLimit"

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "ai", "system"]),
    text: z.string().max(500, "Message is too long")
  })),
  language: z.string().optional().default("English"),
  accessibleRoute: z.boolean().optional().default(false)
})

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    if (!chatRateLimiter.check(ip)) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    const parsed = ChatRequestSchema.safeParse(await req.json())

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request format", details: parsed.error }, { status: 400 })
    }
    const { messages, language, accessibleRoute } = parsed.data;

    const conversation = messages.map((m: { role: string; text: string }) => `${m.role === 'ai' ? 'Assistant' : 'User'}: ${m.text}`).join('\n\n');
    
    let systemInstruction = `You are a helpful stadium assistant for the FIFA World Cup 2026. Keep answers concise. `
    systemInstruction += `You MUST strictly reply in the following language: ${language}. `
    if (accessibleRoute) {
      systemInstruction += `The user requires WHEELCHAIR ACCESSIBLE ROUTING. You MUST prioritize elevators and ramps, and explicitly state accessible paths in your directions. `
    }
    systemInstruction += `\n\nHere is the conversation history:\n\n${conversation}\n\nPlease respond to the user's last message.`

    let response;
    let retries = 3;
    let delay = 1000;

    while (retries > 0) {
      try {
        response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: [
            {
              role: "user",
              parts: [{ text: systemInstruction }],
            },
          ],
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                reply: {
                  type: Type.STRING,
                  description: "The assistant's conversational reply to the user.",
                },
                highlightGate: {
                  type: Type.STRING,
                  description: "The specific stadium gate to highlight on the map (A, B, C, or D). Return null if no gate should be highlighted.",
                  nullable: true,
                },
              },
              required: ["reply", "highlightGate"],
            },
          }
        })
        break; // Success, exit retry loop
      } catch (err: unknown) {
        const error = err as { message?: string; status?: number };
        if (error?.message?.includes("503") || error?.status === 503 || error?.message?.includes("429") || error?.status === 429 || error?.message?.toLowerCase().includes("rate limit")) {
          retries--;
          if (retries === 0) {
            // Graceful fallback instead of throwing error to the UI
            return NextResponse.json({ 
              reply: "I'm currently experiencing very high demand and my circuits are a bit overloaded! Please try again in a moment while I catch my breath.",
              highlightGate: null 
            })
          }
          await new Promise(res => setTimeout(res, delay));
          delay *= 2; // Exponential backoff
        } else {
          throw err;
        }
      }
    }

    const result = JSON.parse(response?.text || "{}")
    const reply = result.reply || "Sorry, I couldn't generate a response."
    const highlightGate = result.highlightGate || null

    return NextResponse.json({ reply, highlightGate })
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Chat API error:", err)
    return NextResponse.json({ error: err.message || "Failed to process chat" }, { status: 500 })
  }
}

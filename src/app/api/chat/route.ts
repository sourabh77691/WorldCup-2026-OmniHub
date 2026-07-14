import { NextResponse } from "next/server"
import { GoogleGenAI, Type } from "@google/genai"
import { z } from "zod"
import { chatRateLimiter } from "@/lib/rateLimit"

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "ai"]),
    text: z.string()
  }))
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
    const { messages } = parsed.data

    const conversation = messages.map((m: any) => `${m.role === 'ai' ? 'Assistant' : 'User'}: ${m.text}`).join('\n\n');

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
              parts: [{ text: `You are a helpful stadium assistant for the FIFA World Cup 2026. Keep answers concise. Here is the conversation history:\n\n${conversation}\n\nPlease respond to the user's last message.` }],
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
      } catch (err: any) {
        if (err?.message?.includes("503") || err?.status === 503) {
          retries--;
          if (retries === 0) throw new Error("The AI model is currently experiencing high demand. Please try again in a few moments.");
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
  } catch (error: any) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 })
  }
}

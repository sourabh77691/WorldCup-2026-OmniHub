import { NextResponse } from "next/server"
import { GoogleGenAI } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    const conversation = messages.map((m: any) => `${m.role === 'ai' ? 'Assistant' : 'User'}: ${m.text}`).join('\n\n');

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: `You are a helpful stadium assistant for the FIFA World Cup 2026. Keep answers concise. Here is the conversation history:\n\n${conversation}\n\nPlease respond to the user's last message.` }],
        },
      ],
    })

    const reply = response.text || "Sorry, I couldn't generate a response."

    return NextResponse.json({ reply })
  } catch (error: any) {
    console.error("Chat API error:", error)
    return NextResponse.json({ error: error.message || "Failed to process chat" }, { status: 500 })
  }
}

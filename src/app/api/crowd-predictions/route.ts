import { NextResponse } from "next/server"
import { GoogleGenAI, Type, Schema } from "@google/genai"

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export async function GET() {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: "Analyze the current stadium crowd flow for a World Cup 2026 match. Return structured JSON with 2-3 hotspots and 2-3 actionable recommendations." }],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hotspots: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  location: { type: Type.STRING },
                  estimatedWaitTime: { type: Type.STRING },
                  severity: { type: Type.STRING, enum: ["Medium", "High"] },
                },
              },
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            incidentCount: { type: Type.INTEGER },
          },
          required: ["hotspots", "recommendations", "incidentCount"],
        } as Schema,
      },
    })

    const text = response.text
    if (text) {
      return NextResponse.json(JSON.parse(text))
    } else {
      throw new Error("No text generated")
    }
  } catch (error) {
    console.error("Crowd Prediction API error:", error)
    // Fallback data if AI fails
    return NextResponse.json({
      hotspots: [
        { location: "Gate A", estimatedWaitTime: "25 min", severity: "High" },
        { location: "Concourse North", estimatedWaitTime: "15 min", severity: "Medium" }
      ],
      recommendations: ["Reroute fans from Gate A to Gate B", "Deploy additional staff to Concourse North"],
      incidentCount: 2
    })
  }
}

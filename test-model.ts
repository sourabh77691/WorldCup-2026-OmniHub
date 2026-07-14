import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test(modelName: string) {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [{ role: "user", parts: [{ text: "hello" }] }],
    });
    console.log(`[SUCCESS] ${modelName}:`, response.text);
  } catch (e: any) {
    console.log(`[FAILED] ${modelName}:`, e.message);
  }
}

async function run() {
  await test("gemini-flash-latest");
  await test("gemini-3-flash-preview");
  await test("gemini-2.5-flash-lite");
  await test("gemini-3.5-flash");
}
run();

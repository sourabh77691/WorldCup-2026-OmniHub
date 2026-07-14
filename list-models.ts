import { GoogleGenAI } from "@google/genai";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listModels() {
  try {
    const models = await ai.models.list();
    console.log("Models:");
    // @ts-expect-error GenAI types might be missing model field but it exists on response
    models.forEach((m) => console.log(m.name));
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

listModels();

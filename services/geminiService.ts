import { GoogleGenAI } from "@google/genai";
import { Track } from "../types";

const apiKey = process.env.API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export const generateAnalysis = async (
  tracks: Track[],
  artists: string[],
  type: "vibe" | "roast",
): Promise<string> => {
  if (!apiKey) {
    return "API KEY MISSING - CANNOT SCAN.";
  }

  const trackList = tracks
    .slice(0, 10)
    .map((t) => `${t.name} by ${t.artist}`)
    .join(", ");
  const artistList = artists.slice(0, 5).join(", ");

  let prompt = "";

  if (type === "vibe") {
    prompt = `Imagine you are a music critic writing a receipt note. 
    Analyze this customer's taste based on: [${trackList}] and artists: [${artistList}].
    Provide a detailed "VIBE CHECK".
    
    Constraints:
    1. Write 2-3 sentences (approx 30-40 words).
    2. Be specific, slightly hipster, and observant.
    3. Return ONLY the text, uppercase.`;
  } else {
    prompt = `Imagine you are a mean, snarky cashier roasting a customer.
    Roast this customer's music taste based on: [${trackList}] and artists: [${artistList}].
    
    Constraints:
    1. Write 2-3 sentences (approx 30-40 words).
    2. Be savage, funny, and judgmental.
    3. Return ONLY the text, uppercase.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text.trim().toUpperCase();
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "SYSTEM ERROR: ANALYSIS FAILED";
  }
};


import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

// IMPORTANT: Do NOT hardcode the API key in the code.
// This is done for demonstration purposes only. In a real app,
// the key should be stored in a secure environment variable.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. AI features will be disabled. Please set process.env.API_KEY.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateRCAWithGemini = async (ticketDescription: string): Promise<string> => {
  if (!ai) {
    return "AI service is not available. Please configure the API key.";
  }
  
  try {
    const prompt = `Based on the following helpdesk ticket description for a facility management system, generate a plausible, concise Root Cause Analysis (RCA) in one or two professional sentences.
    
    Ticket Description: "${ticketDescription}"
    
    RCA:`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    // Use the .text accessor as per the new SDK guidelines
    const text = response.text;

    if (!text) {
        throw new Error("No text returned from Gemini API.");
    }

    return text.trim();

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Failed to generate RCA due to an API error.";
  }
};

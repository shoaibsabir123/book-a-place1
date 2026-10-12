import { GoogleGenAI } from "@google/genai";

// Shared server-side Gemini client with mandated aistudio-build header
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

import { GoogleGenAI } from "@google/genai";
import type { LLMProvider, LLMRequest } from "./types";

const defaultModel = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;

async function generateText(req: LLMRequest): Promise<string> {
  if (!apiKey) {
    throw new Error("Gemini API key is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const response = await ai.models.generateContent({
    model: defaultModel,
    contents: [
      {
        role: "user",
        parts: [{ text: req.userPrompt }],
      },
    ],
    config: {
      systemInstruction: req.systemPrompt,
      temperature: req.temperature ?? 0.7,
      maxOutputTokens: 8192,
    },
  });

  return response.text ?? "";
}

export const geminiProvider: LLMProvider = {
  id: "gemini",
  displayName: "Gemini",
  supportsJson: true,
  generateText,
};

import type { LLMProvider, LLMRequest } from "./types";

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const defaultModel = import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini";

async function generateText(req: LLMRequest): Promise<string> {
  if (!apiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: defaultModel,
      messages: [
        req.systemPrompt ? { role: "system", content: req.systemPrompt } : null,
        { role: "user", content: req.userPrompt },
      ].filter(Boolean),
      temperature: req.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0]?.message?.content;
  return choice || "";
}

export const openaiProvider: LLMProvider = {
  id: "openai",
  displayName: "OpenAI",
  supportsJson: true,
  generateText,
};

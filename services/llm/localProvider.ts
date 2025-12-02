import type { LLMProvider, LLMRequest } from "./types";

const localEndpoint = import.meta.env.VITE_LOCAL_LLM_ENDPOINT || "http://localhost:11434/api/generate";

async function generateText(req: LLMRequest): Promise<string> {
  const response = await fetch(localEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: req.userPrompt,
      system: req.systemPrompt,
      temperature: req.temperature ?? 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Local LLM error: ${response.status} ${errorText}`);
  }

  try {
    const data = await response.json();
    return data.response || data.text || "";
  } catch {
    const text = await response.text();
    return text;
  }
}

export const localProvider: LLMProvider = {
  id: "local",
  displayName: "Local LLM",
  supportsJson: false,
  generateText,
};

import type { LLMProvider, LLMProviderId } from "./types";
import { geminiProvider } from "./geminiProvider";
import { openaiProvider } from "./openaiProvider";
import { localProvider } from "./localProvider";

const providers: Record<LLMProviderId, LLMProvider> = {
  gemini: geminiProvider,
  openai: openaiProvider,
  anthropic: {
    id: "anthropic",
    displayName: "Anthropic Claude",
    supportsJson: true,
    async generateText() {
      throw new Error("Anthropic provider not implemented yet.");
    },
  },
  local: localProvider,
};

export function getProvider(id: LLMProviderId): LLMProvider {
  return providers[id];
}

export function listProviders(): LLMProvider[] {
  return Object.values(providers);
}

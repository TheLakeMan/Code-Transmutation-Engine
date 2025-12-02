export type LLMProviderId = "gemini" | "openai" | "anthropic" | "local";

export interface LLMRequest {
  systemPrompt?: string;
  userPrompt: string;
  temperature?: number;
}

export interface LLMProvider {
  id: LLMProviderId;
  displayName: string;
  supportsJson: boolean;
  generateText(req: LLMRequest): Promise<string>;
}

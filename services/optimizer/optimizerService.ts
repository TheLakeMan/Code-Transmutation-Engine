import type { LLMProvider } from "../llm/types";
import { calculateMetrics, type CodeMetrics } from "../../utils/codeMetrics";
import type { RefactorReport, RefactorAnalysis } from "./types";
import { computeRSI } from "./rsi";

const REFACTOR_ANALYSIS_SYSTEM = `
You are a senior software engineer and code reviewer.
Analyze the given code and propose safe, practical refactorings.

Return STRICT JSON with this schema:
{
  "summary": string,
  "issues": [
    {
      "kind": "style" | "performance" | "complexity" | "dead_code" | "safety" | "other",
      "description": string,
      "locationHint": string
    }
  ],
  "refactorGoals": string[],
  "highLevelPlan": string[]
}
Output ONLY JSON, no extra text.
`;

const REFACTOR_APPLY_SYSTEM = `
You are a refactoring engine.

Given source code and a refactor plan, produce a new version of the code.

Requirements:
- Preserve public behavior and interfaces as much as possible.
- Keep the same language and runtime (no framework changes).
- Do NOT introduce new external dependencies.
- Do NOT invent APIs or modules that are not already present.
- Keep comments that explain non-obvious logic.
- Prefer smaller, incremental improvements over massive rewrites.
- Output ONLY the full refactored code, no explanations, no markdown.
`;

interface OptimizeOptions {
  code: string;
  language: string;
  goals: string[];
  provider: LLMProvider;
}

export async function optimizeCode(options: OptimizeOptions): Promise<RefactorReport> {
  const { code, language, goals, provider } = options;

  const analysisText = await provider.generateText({
    systemPrompt: REFACTOR_ANALYSIS_SYSTEM,
    userPrompt: `
Language: ${language}
Refactor goals: ${goals.join(", ")}

CODE:
${code}
`,
    temperature: 0.2,
  });

  let analysis: RefactorAnalysis;
  try {
    analysis = JSON.parse(analysisText);
  } catch {
    analysis = {
      summary: "Model returned unparsable analysis.",
      issues: [],
      refactorGoals: goals,
      highLevelPlan: [],
    };
  }

  const optimizedCode = await provider.generateText({
    systemPrompt: REFACTOR_APPLY_SYSTEM,
    userPrompt: `
Language: ${language}
Desired refactor goals: ${(analysis.refactorGoals || goals).join(", ")}

Refactor plan:
${(analysis.highLevelPlan || []).join("\n")}

Original code:
${code}
`,
    temperature: 0.15,
  });

  const metricsBefore = calculateMetrics(code, code);
  const metricsAfter = calculateMetrics(optimizedCode, optimizedCode);

  const realityStabilizationBefore = computeRSI(metricsBefore);
  const realityStabilizationAfter = computeRSI(metricsAfter);

  return {
    originalCode: code,
    optimizedCode,
    analysis,
    metricsBefore,
    metricsAfter,
    realityStabilizationBefore,
    realityStabilizationAfter,
  };
}

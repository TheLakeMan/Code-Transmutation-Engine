import type { LLMProvider } from "./llm/types";
import { calculateMetrics } from "../utils/codeMetrics";
import { ProcessPhase, type CycleData } from "../types";

interface IgniteOptions {
  sourceCode: string;
  cycles: number;
  heatTemp: number;
  coolTemp: number;
  provider: LLMProvider;
  onUpdate?: (cycle: CycleData) => void;
  onPhaseChange?: (phase: ProcessPhase) => void;
  shouldStop?: () => boolean;
}

export async function ignite(options: IgniteOptions): Promise<CycleData[]> {
  const {
    sourceCode,
    cycles,
    heatTemp,
    coolTemp,
    provider,
    onUpdate,
    onPhaseChange,
    shouldStop,
  } = options;

  let currentCode = sourceCode;
  const history: CycleData[] = [];

  for (let i = 0; i < cycles; i++) {
    if (shouldStop?.()) break;

    const cycleNumber = i + 1;

    onPhaseChange?.(ProcessPhase.HEAT);
    const heatCode = await provider.generateText({
      systemPrompt: "Return only valid source code, no explanations.",
      userPrompt: `
You are a creative transformation engine.
Transform the following code into a more experimental or alternative version,
keeping it syntactically valid.

CODE:
${currentCode}
`,
      temperature: heatTemp,
    });

    if (shouldStop?.()) break;

    onPhaseChange?.(ProcessPhase.COOL);
    const coolCode = await provider.generateText({
      systemPrompt: "Return only valid source code, no explanations.",
      userPrompt: `
You are a stabilizing refactor engine.
Clean and normalize the following code while preserving its behavior
as much as possible. Prefer clarity and structure.

CODE:
${heatCode}
`,
      temperature: coolTemp,
    });

    const metrics = calculateMetrics(heatCode, coolCode);

    const cycleData: CycleData = {
      cycleNumber,
      heatOutput: heatCode,
      coolOutput: coolCode,
      timestamp: Date.now(),
      metrics,
    };

    history.push(cycleData);
    currentCode = coolCode;
    onUpdate?.(cycleData);
  }

  onPhaseChange?.(ProcessPhase.COMPLETE);
  return history;
}

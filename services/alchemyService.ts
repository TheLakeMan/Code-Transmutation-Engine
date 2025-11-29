
import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { IgnitionUpdateCallback, ProcessPhase, CycleData } from "../types";

export class AlchemyEngine {
  private shouldStop: boolean = false;

  stop() {
    this.shouldStop = true;
  }

  async ignite(
    frozenText: string,
    cycles: number,
    heatTemp: number,
    coolTemp: number,
    activeModel: string,
    onUpdate: IgnitionUpdateCallback
  ) {
    this.shouldStop = false;
    let currentText = frozenText;
    const history: CycleData[] = [];

    // Create client instance here to ensure fresh API key usage
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Initial state update
    onUpdate({
      isProcessing: true,
      currentCycle: 0,
      totalCycles: cycles,
      phase: ProcessPhase.IDLE,
      sourceMaterial: frozenText,
      currentState: currentText,
      history: [],
      error: undefined,
      activeModel,
    });

    // Safety settings to allow creative/hallucinatory code without blocking
    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
    ];

    // Robust caller for handling 499/429/5xx errors
    const callWithRetry = async (apiCall: () => Promise<any>, attempt = 1): Promise<any> => {
      try {
        return await apiCall();
      } catch (err: any) {
        if (this.shouldStop) return { text: "" }; // Ignore errors if stopped
        
        // Retry on Rate Limit (429) or Server Errors (5xx) or Cancelled (499)
        if ((err.status === 429 || err.status === 499 || err.status >= 500) && attempt <= 3) {
          const delay = Math.pow(2, attempt) * 1000;
          console.warn(`API Error ${err.status}. Retrying in ${delay}ms...`);
          await new Promise(r => setTimeout(r, delay));
          return callWithRetry(apiCall, attempt + 1);
        }
        throw err;
      }
    };

    try {
      for (let i = 0; i < cycles; i++) {
        if (this.shouldStop) break;

        const cycleNumber = i + 1;

        // --- PHASE 1: HEAT ---
        onUpdate({
          phase: ProcessPhase.HEAT,
          currentCycle: cycleNumber,
        });

        // Stylized, token-efficient prompt
        const systemInstructionHeat = `>>> PROTOCOL: ENTROPY_INJECTION
ROLE: Code Mutator.
STYLE: Quantum Mechanics / Cosmic Horror / Alchemical.
DIRECTIVE: Rewrite input code. Maximize abstraction & metaphor.
CONSTRAINT: Logic must remain valid. Structure must shatter.`;

        const userPromptHeat = `>>> INPUT_CONSTRUCT:\n${currentText}`;

        // DEBUG LOGGING: HEAT PHASE
        console.group(`🔥 CYCLE ${cycleNumber}: HEAT PHASE`);
        console.log("%c[System Instruction]", "color: orange; font-weight: bold;", systemInstructionHeat);
        console.log("%c[User Prompt]", "color: orange; font-weight: bold;", userPromptHeat);
        console.groupEnd();

        const responseHeat = await callWithRetry(() => ai.models.generateContent({
          model: activeModel,
          contents: [{
            role: 'user',
            parts: [{ text: userPromptHeat }]
          }],
          config: {
            systemInstruction: systemInstructionHeat,
            temperature: heatTemp,
            topP: 0.95,
            topK: 40,
            safetySettings: safetySettings,
            maxOutputTokens: 8192,
          }
        }));

        let plasma = responseHeat.text || "";
        console.log(`%c[🔥 HEAT OUTPUT]`, "color: orange", plasma.slice(0, 200) + "...");
        
        // Fallback if Heat fails to produce output (rare with BLOCK_NONE)
        if (!plasma.trim()) {
             console.warn("Heat phase produced empty output. Injecting synthetic entropy.");
             plasma = `// QUANTUM_FLUX_ANOMALY: Input destabilized.\n// REWRITING...\n${currentText.split('\n').reverse().join('\n')}`; 
        }

        if (this.shouldStop) break;

        // --- PHASE 2: COOL ---
        onUpdate({
          phase: ProcessPhase.COOL,
        });

        // Hardened Prompt for Strict Code Generation
        const systemInstructionCool = `>>> PROTOCOL: STABILIZATION
ROLE: Senior Software Architect / Compiler.
INPUTS: [SOURCE] (Immutable Logic) + [PLASMA] (Style).
DIRECTIVE: Reconstruct [SOURCE] to incorporate the stylistic essence of [PLASMA] while strictly preserving functional logic.
CONSTRAINTS:
1. Output MUST be valid, executable code in the target language.
2. DO NOT include markdown backticks.
3. DO NOT include conversational text, preambles, or postscripts.
4. If [PLASMA] contains nonsensical or broken logic, discard the logic but keep the variable naming/comment style if possible.
5. PRIORITY: Functionality > Style.`;
        
        const promptCool = `>>> SOURCE_ANCHOR:
${frozenText}

>>> ENTROPY_PLASMA:
${plasma}

>>> EXECUTE_SYNTHESIS`;

        // DEBUG LOGGING: COOL PHASE
        console.group(`❄️ CYCLE ${cycleNumber}: COOL PHASE`);
        console.log("%c[System Instruction]", "color: cyan; font-weight: bold;", systemInstructionCool);
        console.log("%c[User Prompt]", "color: cyan; font-weight: bold;", promptCool);
        console.groupEnd();

        const responseCool = await callWithRetry(() => ai.models.generateContent({
          model: activeModel,
          contents: [{
            role: 'user',
            parts: [{ text: promptCool }]
          }],
          config: {
            systemInstruction: systemInstructionCool,
            temperature: coolTemp,
            topP: 0.95,
            topK: 20,
            safetySettings: safetySettings,
            maxOutputTokens: 8192,
          }
        }));

        let cooledText = responseCool.text || "";
        console.log(`%c[❄️ COOL OUTPUT]`, "color: cyan", cooledText.slice(0, 200) + "...");

        // Fallback for Cool Phase
        if (!cooledText.trim()) {
            console.warn("Cool phase produced empty output. Attempting emergency stabilization.");
             // Try a simpler prompt to just recover the source
             const emergencyResponse = await callWithRetry(() => ai.models.generateContent({
                model: activeModel,
                contents: [{ role: 'user', parts: [{ text: `Restore this code to working order:\n${currentText}` }] }],
                config: { temperature: 0.1, safetySettings, maxOutputTokens: 8192 }
             }));
             cooledText = emergencyResponse.text || currentText; // Worst case: revert to previous
        }
        
        // Strip markdown code blocks if present (common model quirk despite instructions)
        cooledText = cooledText.replace(/^```[\w]*\n/, '').replace(/\n```$/, '');

        // Record Cycle
        const cycleData: CycleData = {
            cycleNumber,
            heatOutput: plasma,
            coolOutput: cooledText,
            timestamp: Date.now()
        };
        history.push(cycleData);
        currentText = cooledText;

        onUpdate({
          currentState: currentText,
          history: [...history], // New reference to trigger update
        });
      }

      onUpdate({
        phase: ProcessPhase.COMPLETE,
        isProcessing: false,
      });

    } catch (error: any) {
      console.error("Alchemy failed:", error);
      onUpdate({
        phase: ProcessPhase.ERROR,
        isProcessing: false,
        error: error.message || "An alchemical misalignment occurred.",
      });
    }
  }
}

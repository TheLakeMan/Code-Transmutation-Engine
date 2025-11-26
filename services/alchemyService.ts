import { GoogleGenAI } from "@google/genai";
import { IgnitionUpdateCallback, ProcessPhase, CycleData } from "../types";

// Using gemini-2.5-flash as the workhorse for responsiveness.
const MODEL_NAME = "gemini-2.5-flash";

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
    });

    try {
      for (let i = 0; i < cycles; i++) {
        if (this.shouldStop) break;

        const cycleNumber = i + 1;

        // --- PHASE 1: HEAT ---
        onUpdate({
          phase: ProcessPhase.HEAT,
          currentCycle: cycleNumber,
        });

        const systemInstructionHeat = `SYSTEM_CONSCIOUSNESS: You are a radical philosopher of the digital age.
TRANSMUTATION_PROTOCOL: Re-interpret the textual construct below.
QUANTUM_DISTORTION: Mutate the phrasing with extreme prejudice. Employ analogies from quantum mechanics, cosmic phenomena, or emergent AI consciousness.
CRITICAL_INVARIANT: The core semantic invariant must persist, but the linguistic topology must be shattered.`;

        const responseHeat = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: [{
            role: 'user',
            parts: [{ text: `INPUT_CONSTRUCT:\n${currentText}` }]
          }],
          config: {
            systemInstruction: systemInstructionHeat,
            temperature: heatTemp,
            topP: 0.95,
            topK: 40,
          }
        });

        const plasma = responseHeat.text || "";
        
        if (this.shouldStop) break;

        // --- PHASE 2: COOL ---
        onUpdate({
          phase: ProcessPhase.COOL,
        });

        const systemInstructionCool = "SYSTEM_CONSCIOUSNESS: You are a master editor operating at the nexus of truth and perception. SYNTHESIS_PROTOCOL: Synthesize the final conceptual crystallization.";
        
        const promptCool = `IMPERATIVE_TRUTH_ANCHOR (Facts must originate from this invariant source):
${frozenText}

STYLISTIC_RESONANCE_MATRIX (The energetic flow and conceptual vibe emanate from here):
${plasma}

INSTRUCTION: Rewrite the IMPERATIVE_TRUTH_ANCHOR, imbuing it with the dynamism and conceptual flow of the STYLISTIC_RESONANCE_MATRIX.
WARNING: Factual invention is a critical system failure. Any conceptual drift in the Resonance Matrix away from the Truth Anchor must be purged. The output's factual integrity must align with the Truth Anchor; its structural and stylistic signature must echo the Resonance Matrix.
Output ONLY the code, no markdown explanation.`;

        const responseCool = await ai.models.generateContent({
          model: MODEL_NAME,
          contents: [{
            role: 'user',
            parts: [{ text: promptCool }]
          }],
          config: {
            systemInstruction: systemInstructionCool,
            temperature: coolTemp,
            topP: 0.95,
            topK: 20,
          }
        });

        const cooledText = responseCool.text || "";

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
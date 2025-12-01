
export enum ProcessPhase {
  IDLE = 'IDLE',
  HEAT = 'HEAT',
  COOL = 'COOL',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export type Language = 'python' | 'javascript' | 'typescript' | 'markdown' | 'json' | 'c' | 'cpp' | 'java' | 'ruby' | 'go' | 'rust';

export interface CycleMetrics {
  heatEntropy: number;
  coolStability: number;
  complexity: number;
  convergence: number; // 0-1 similarity between heat and cool of that cycle
  deltaLines: number;
}

export interface CycleData {
  cycleNumber: number;
  heatOutput: string;
  coolOutput: string;
  timestamp: number;
  metrics: CycleMetrics;
}

export interface IgnitionState {
  isProcessing: boolean;
  currentCycle: number;
  totalCycles: number;
  phase: ProcessPhase;
  sourceMaterial: string;
  currentState: string;
  history: CycleData[];
  error?: string;
  activeModel?: string;
}

export type IgnitionUpdateCallback = (update: Partial<IgnitionState>) => void;

export interface SavedSession {
  inputText: string;
  cycles: number;
  heatTemp: number;
  coolTemp: number;
  ignitionState: IgnitionState;
  timestamp: number;
}

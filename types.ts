
export enum ProcessPhase {
  IDLE = 'IDLE',
  HEAT = 'HEAT',
  COOL = 'COOL',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface CycleData {
  cycleNumber: number;
  heatOutput: string;
  coolOutput: string;
  timestamp: number;
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

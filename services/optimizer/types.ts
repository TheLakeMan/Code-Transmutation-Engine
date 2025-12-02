import type { CodeMetrics } from "../../utils/codeMetrics";

export interface RefactorIssue {
  kind: "style" | "performance" | "complexity" | "dead_code" | "safety" | "other";
  description: string;
  locationHint: string;
}

export interface RefactorAnalysis {
  summary: string;
  issues: RefactorIssue[];
  refactorGoals: string[];
  highLevelPlan: string[];
}

export interface RefactorReport {
  originalCode: string;
  optimizedCode: string;
  analysis: RefactorAnalysis;
  metricsBefore: CodeMetrics;
  metricsAfter: CodeMetrics;
  realityStabilizationBefore: number;
  realityStabilizationAfter: number;
}

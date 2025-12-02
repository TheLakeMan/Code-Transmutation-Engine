import type { CodeMetrics } from "../../utils/codeMetrics";

function clamp01(v: number): number {
  if (Number.isNaN(v)) return 0.5;
  return Math.max(0, Math.min(1, v));
}

export function computeRSI(m: CodeMetrics): number {
  const entropy = clamp01(m.heatEntropy);
  const stability = clamp01(m.coolStability ?? 0.5);
  const convergence = clamp01(m.convergence ?? 0.5);
  const complexityNorm = clamp01(m.complexity / 80);

  const score =
    0.3 * (1 - entropy) +
    0.3 * (1 - complexityNorm) +
    0.2 * stability +
    0.2 * convergence;

  return clamp01(score);
}

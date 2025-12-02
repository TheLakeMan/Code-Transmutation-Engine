import type { RefactorReport } from "../services/optimizer/types";
import { CodeEditor } from "./CodeEditor";

interface Props {
  report: RefactorReport | null;
}

export function RefactorResultPanel({ report }: Props) {
  if (!report) return null;

  const {
    originalCode,
    optimizedCode,
    analysis,
    metricsBefore,
    metricsAfter,
    realityStabilizationBefore,
    realityStabilizationAfter,
  } = report;

  const beforeLines = originalCode.split("\n").length;
  const afterLines = optimizedCode.split("\n").length;

  return (
    <div className="refactor-result space-y-4 bg-slate-800/30 border border-slate-700 rounded-xl p-6">
      <h2 className="text-xl font-bold text-white">Refactor Summary</h2>
      <p className="text-slate-200/80">{analysis.summary}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/60">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Reality Stabilization</h3>
          <p className="text-lg font-mono text-emerald-300">
            {realityStabilizationBefore.toFixed(2)} → {realityStabilizationAfter.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/60">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Metrics</h3>
          <ul className="text-sm text-slate-200/80 space-y-1">
            <li>
              Complexity: {metricsBefore.complexity.toFixed(1)} → {metricsAfter.complexity.toFixed(1)}
            </li>
            <li>
              Entropy: {metricsBefore.heatEntropy.toFixed(2)} → {metricsAfter.heatEntropy.toFixed(2)}
            </li>
            <li>Lines of code: {beforeLines} → {afterLines}</li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/60">
        <h3 className="text-sm font-semibold text-slate-300 mb-2">Issues &amp; Plan</h3>
        <ul className="list-disc list-inside space-y-1 text-slate-200/80">
          {analysis.issues.map((issue, i) => (
            <li key={i}>
              <strong className="text-white capitalize">{issue.kind}</strong>: {issue.description}
              {issue.locationHint && <em className="text-slate-400"> ({issue.locationHint})</em>}
            </li>
          ))}
        </ul>
        <h4 className="text-sm font-semibold text-slate-300 mt-3 mb-1">Refactor Plan</h4>
        <ol className="list-decimal list-inside space-y-1 text-slate-200/80">
          {analysis.highLevelPlan.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Original</h4>
          <CodeEditor value={originalCode} readOnly />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-300 mb-2">Refactored</h4>
          <CodeEditor value={optimizedCode} readOnly />
        </div>
      </div>
    </div>
  );
}

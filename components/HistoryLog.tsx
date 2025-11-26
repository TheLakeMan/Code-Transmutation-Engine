import React from 'react';
import { CycleData } from '../types';
import { ChevronRight } from 'lucide-react';

interface HistoryLogProps {
  history: CycleData[];
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className="mt-12 space-y-8">
      <h3 className="text-xl font-bold text-slate-300 border-b border-slate-700 pb-2">Refactoring Log</h3>
      <div className="space-y-4">
        {history.map((cycle) => (
          <div key={cycle.cycleNumber} className="bg-slate-800/40 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center gap-2 mb-4">
                <span className="bg-slate-700 text-slate-300 text-xs font-bold px-2 py-1 rounded">CYCLE {cycle.cycleNumber}</span>
                <span className="text-slate-500 text-xs font-mono">{new Date(cycle.timestamp).toLocaleTimeString()}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <h4 className="text-magma-500 text-xs font-bold mb-2 uppercase tracking-wider">Mutation (Experimental)</h4>
                    <pre className="text-slate-400 text-xs leading-relaxed font-mono opacity-80 overflow-x-auto bg-slate-950/50 p-2 rounded">{cycle.heatOutput.slice(0, 300)}...</pre>
                </div>
                <div>
                    <h4 className="text-frost-500 text-xs font-bold mb-2 uppercase tracking-wider">Stabilized Build (Production)</h4>
                    <pre className="text-slate-300 text-xs leading-relaxed font-mono overflow-x-auto bg-slate-950/50 p-2 rounded">{cycle.coolOutput.slice(0, 300)}...</pre>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
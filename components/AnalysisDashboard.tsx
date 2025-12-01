
import React from 'react';
import { CycleData } from '../types';
import { SpiralChart } from './visualizations/SpiralChart';
import { TrendChart } from './visualizations/TrendChart';
import { Activity, Zap, GitCommit, Layers } from 'lucide-react';
import { calcSimilarity } from '../utils/codeMetrics';

interface AnalysisDashboardProps {
  history: CycleData[];
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ history }) => {
  const lastCycle = history[history.length - 1];
  
  // Calculate final convergence (Cycle N vs Cycle N) is always 1.
  // We want Cycle 1 vs Final to see the journey.
  const startToFinishConvergence = history.length > 0 
    ? calcSimilarity(history[0].sourceMaterial || history[0].coolOutput, lastCycle.coolOutput)
    : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Row: KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 text-magma-500 mb-1">
                  <Zap className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Peak Entropy</span>
              </div>
              <div className="text-2xl font-mono text-white">
                  {history.length > 0 ? Math.max(...history.map(c => c.metrics.heatEntropy)).toFixed(2) : "0.00"}
              </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 text-frost-500 mb-1">
                  <Activity className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Avg Stability</span>
              </div>
              <div className="text-2xl font-mono text-white">
                  {history.length > 0 ? (history.reduce((a,c) => a + c.metrics.coolStability, 0) / history.length).toFixed(2) : "0.00"}
              </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 text-emerald-500 mb-1">
                  <GitCommit className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Initial Drift</span>
              </div>
              <div className="text-2xl font-mono text-white">
                   {history.length > 0 ? ((1 - startToFinishConvergence) * 100).toFixed(0) + "%" : "0%"}
              </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
              <div className="flex items-center gap-2 text-violet-500 mb-1">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase">Complexity</span>
              </div>
              <div className="text-2xl font-mono text-white">
                   {history.length > 0 ? lastCycle.metrics.complexity.toFixed(1) : "0.0"}
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Visualization: Spiral */}
          <div className="lg:col-span-2">
              <SpiralChart history={history} />
          </div>

          {/* Side Panel: Trends */}
          <div className="space-y-4">
              <TrendChart 
                  history={history} 
                  dataKey="entropy" 
                  color="#f97316" 
                  title="System Entropy" 
              />
              <TrendChart 
                  history={history} 
                  dataKey="stability" 
                  color="#38bdf8" 
                  title="Stabilization" 
              />
              <TrendChart 
                  history={history} 
                  dataKey="complexity" 
                  color="#8b5cf6" 
                  title="Code Complexity" 
              />
              
              {/* Mini Heatmap Timeline */}
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                  <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Cycle Heatmap</span>
                  <div className="flex flex-wrap gap-1">
                      {history.map((cycle, i) => {
                          // Color based on entropy (Heat)
                          const opacity = 0.2 + (cycle.metrics.heatEntropy * 0.8);
                          return (
                              <div 
                                key={i}
                                title={`Cycle ${cycle.cycleNumber}: Entropy ${cycle.metrics.heatEntropy.toFixed(2)}`}
                                className="w-2 h-4 rounded-sm bg-magma-500 transition-all hover:scale-125 hover:z-10 cursor-help"
                                style={{ opacity }}
                              />
                          )
                      })}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Flame, Snowflake, ArrowRight } from 'lucide-react';
import { ProcessPhase } from '../types';

interface ProcessVisualizerProps {
  phase: ProcessPhase;
  heatText: string;
  coolText: string;
}

export const ProcessVisualizer: React.FC<ProcessVisualizerProps> = ({ phase, heatText, coolText }) => {
  const isHeat = phase === ProcessPhase.HEAT;
  const isCool = phase === ProcessPhase.COOL;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
      {/* HEAT CHAMBER */}
      <div 
        className={`relative rounded-xl border-2 overflow-hidden transition-all duration-500 h-64 md:h-80 flex flex-col
          ${isHeat 
            ? 'border-magma-500 shadow-[0_0_30px_rgba(249,115,22,0.4)] bg-magma-900/10' 
            : 'border-slate-700 bg-slate-800/50 opacity-60'
          }`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-magma-700 via-magma-500 to-magma-300" />
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-magma-400 font-bold tracking-wider">
                <Flame className={`w-5 h-5 ${isHeat ? 'animate-pulse' : ''}`} />
                PHASE 1: ENTROPY
            </div>
            {isHeat && <span className="text-xs text-magma-500 font-mono animate-pulse">GENERATING CHAOS...</span>}
        </div>
        <div className="p-4 overflow-y-auto font-mono text-xs text-magma-100/90 leading-relaxed custom-scrollbar whitespace-pre-wrap">
            {isHeat ? (
               <div className="animate-pulse space-y-2">
                 <div className="h-2 bg-magma-500/20 rounded w-3/4"></div>
                 <div className="h-2 bg-magma-500/20 rounded w-full"></div>
                 <div className="h-2 bg-magma-500/20 rounded w-5/6"></div>
                 <div className="mt-4 text-magma-300 italic opacity-80">
                    "Injecting entropy... Breaking patterns..."
                 </div>
               </div>
            ) : (
                heatText ? heatText : <span className="text-slate-500 italic">Waiting for code injection...</span>
            )}
        </div>
      </div>

      {/* COOL CHAMBER */}
      <div 
        className={`relative rounded-xl border-2 overflow-hidden transition-all duration-500 h-64 md:h-80 flex flex-col
          ${isCool 
            ? 'border-frost-500 shadow-[0_0_30px_rgba(14,165,233,0.4)] bg-frost-900/10' 
            : 'border-slate-700 bg-slate-800/50 opacity-60'
          }`}
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-frost-700 via-frost-500 to-frost-300" />
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-frost-400 font-bold tracking-wider">
                <Snowflake className={`w-5 h-5 ${isCool ? 'animate-spin-slow' : ''}`} />
                PHASE 2: STABILIZATION
            </div>
            {isCool && <span className="text-xs text-frost-500 font-mono animate-pulse">COMPILING SYNTHESIS...</span>}
        </div>
        <div className="p-4 overflow-y-auto font-mono text-xs text-frost-100/90 leading-relaxed custom-scrollbar whitespace-pre-wrap">
            {isCool ? (
               <div className="animate-pulse space-y-2">
                 <div className="h-2 bg-frost-500/20 rounded w-full"></div>
                 <div className="h-2 bg-frost-500/20 rounded w-3/4"></div>
                 <div className="h-2 bg-frost-500/20 rounded w-5/6"></div>
                 <div className="mt-4 text-frost-300 italic opacity-80">
                    "Refactoring logic... Running tests..."
                 </div>
               </div>
            ) : (
                coolText ? coolText : <span className="text-slate-500 italic">Waiting for experimental build...</span>
            )}
        </div>
      </div>
      
      {/* Connector (Visual only) */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:block text-slate-600 z-10">
        <ArrowRight className="w-8 h-8 opacity-20" />
      </div>
    </div>
  );
};
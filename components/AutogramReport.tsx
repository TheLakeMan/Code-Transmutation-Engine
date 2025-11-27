
import React from 'react';
import { validateAutogram } from '../utils/autogramValidator';
import { CheckCircle, XCircle } from 'lucide-react';

interface AutogramReportProps {
  output: string;
}

export const AutogramReport: React.FC<AutogramReportProps> = ({ output }) => {
  const { valid, report } = validateAutogram(output);

  return (
    <div className="mt-8 bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2">
      <div className={`p-4 border-b border-slate-700 flex items-center justify-between ${valid ? 'bg-emerald-950/30' : 'bg-red-950/30'}`}>
        <h3 className="font-bold text-slate-200 flex items-center gap-2">
          {valid ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-500" />}
          Autogram Validation Protocol
        </h3>
        <span className={`text-xs font-mono px-2 py-1 rounded border ${valid ? 'border-emerald-500 text-emerald-400 bg-emerald-950' : 'border-red-500 text-red-400 bg-red-950'}`}>
          {valid ? 'SUCCESS: SELF-DESCRIPTIVE' : 'FAILURE: MISMATCH DETECTED'}
        </span>
      </div>
      
      <div className="p-6 overflow-x-auto">
        <table className="w-full text-xs font-mono text-left">
          <thead>
            <tr className="border-b border-slate-700 text-slate-500 uppercase tracking-wider">
              <th className="pb-3 pl-2">Letter</th>
              <th className="pb-3 text-center">Claimed Count</th>
              <th className="pb-3 text-center">Actual Count</th>
              <th className="pb-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(report).map(([letter, data]) => {
              // Only show letters that are relevant (either claimed or appear)
              if (data.claimed === 0 && data.actual === 0) return null;
              
              const isMatch = data.claimed === data.actual;
              
              return (
                <tr key={letter} className={`border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors ${!isMatch ? 'bg-red-900/10' : ''}`}>
                  <td className="py-2 pl-4 font-bold text-slate-300 uppercase">{letter}</td>
                  <td className="py-2 text-center text-slate-400">{data.claimed}</td>
                  <td className="py-2 text-center text-slate-400">{data.actual}</td>
                  <td className="py-2 text-center">
                    {isMatch ? (
                      <span className="text-emerald-500">✓</span>
                    ) : (
                      <span className="text-red-400 font-bold">MISSING {data.claimed - data.actual}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {!valid && (
           <div className="mt-4 text-xs text-red-300 italic">
              * Mismatches detected. The generated sentence is not yet fully self-descriptive. Try increasing cycles or adjusting entropy.
           </div>
        )}
      </div>
    </div>
  );
};

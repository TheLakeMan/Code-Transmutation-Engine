import React, { useState } from 'react';
import { CycleData, Language } from '../types';
import { Maximize2 } from 'lucide-react';
import { MaximizeModal } from './MaximizeModal';

interface HistoryLogProps {
  history: CycleData[];
  language?: Language;
}

export const HistoryLog: React.FC<HistoryLogProps> = ({ history, language }) => {
  const [modalState, setModalState] = useState<{ isOpen: boolean; title: string; content: string }>({
    isOpen: false,
    title: '',
    content: ''
  });

  const openModal = (title: string, content: string) => {
    setModalState({ isOpen: true, title, content });
  };

  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };

  if (history.length === 0) return null;

  return (
    <>
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
                  <div className="relative group">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-magma-500 text-xs font-bold uppercase tracking-wider">Mutation (Experimental)</h4>
                        <button 
                          onClick={() => openModal(`Cycle ${cycle.cycleNumber}: Mutation`, cycle.heatOutput)}
                          className="text-slate-500 hover:text-magma-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Expand"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>
                      <pre className="text-slate-400 text-xs leading-relaxed font-mono opacity-80 overflow-x-auto bg-slate-950/50 p-3 rounded h-32 custom-scrollbar">
                        {cycle.heatOutput}
                      </pre>
                  </div>
                  <div className="relative group">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-frost-500 text-xs font-bold uppercase tracking-wider">Stabilized Build (Production)</h4>
                        <button 
                           onClick={() => openModal(`Cycle ${cycle.cycleNumber}: Stabilized Build`, cycle.coolOutput)}
                           className="text-slate-500 hover:text-frost-500 opacity-0 group-hover:opacity-100 transition-opacity"
                           title="Expand"
                        >
                          <Maximize2 className="w-3 h-3" />
                        </button>
                      </div>
                      <pre className="text-slate-300 text-xs leading-relaxed font-mono overflow-x-auto bg-slate-950/50 p-3 rounded h-32 custom-scrollbar">
                        {cycle.coolOutput}
                      </pre>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MaximizeModal 
        isOpen={modalState.isOpen}
        title={modalState.title}
        content={modalState.content}
        onClose={closeModal}
        language={language}
      />
    </>
  );
};
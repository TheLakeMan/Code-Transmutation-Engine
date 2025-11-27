import React from 'react';
import { X, Copy } from 'lucide-react';

interface MaximizeModalProps {
  title: string;
  content: string;
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

export const MaximizeModal: React.FC<MaximizeModalProps> = ({ title, content, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] w-full max-w-6xl h-[85vh] rounded-xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-800/50">
          <h3 className="text-lg font-bold text-slate-200 tracking-wide uppercase">{title}</h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCopy}
              className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-lg transition-colors border border-slate-700"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 rounded-lg transition-all border border-transparent"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-0 bg-[#0d1117]">
          <pre className="p-6 text-sm font-mono leading-relaxed text-slate-300">
            {content || <span className="text-slate-600 italic">No output generated...</span>}
          </pre>
        </div>
      </div>
    </div>
  );
};
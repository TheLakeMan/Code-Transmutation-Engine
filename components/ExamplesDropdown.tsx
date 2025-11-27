
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';
import { Language } from '../types';
import { BENCHMARKS } from '../utils/benchmarks';

interface ExamplesDropdownProps {
  onSelect: (text: string, lang: Language) => void;
  disabled?: boolean;
}

export const ExamplesDropdown: React.FC<ExamplesDropdownProps> = ({ onSelect, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSelect = (code: string, lang: string) => {
      onSelect(code, lang as Language);
      setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="inline-flex justify-center w-full rounded-md border border-slate-700 shadow-sm px-3 py-1.5 bg-slate-800 text-xs font-medium text-slate-300 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-magma-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors items-center gap-2"
        >
          <BookOpen className="w-3 h-3" />
          Benchmarks
          <ChevronDown className="w-3 h-3 -mr-1" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] border border-slate-700">
            <div className="py-1" role="menu" aria-orientation="vertical">
                {BENCHMARKS.map((ex, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleSelect(ex.code, ex.lang)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center justify-between group"
                        role="menuitem"
                    >
                        <span>{ex.name}</span>
                        <span className="text-[10px] bg-slate-900 text-slate-500 px-1 rounded group-hover:bg-slate-600 group-hover:text-slate-200">{ex.lang}</span>
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

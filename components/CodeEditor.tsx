import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';
import { Language } from '../types';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  language?: Language | string;
}

// Helper to detect indentation-based regions (Python style)
const detectRegions = (code: string) => {
  const lines = code.split('\n');
  const regions = new Map<number, number>(); // startLine -> endLine
  const stack: { indent: number; line: number }[] = [];

  lines.forEach((line, i) => {
    if (!line.trim()) return;

    const indent = line.search(/\S|$/);
    
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      const top = stack.pop()!;
      if (top.indent > indent) {
         regions.set(top.line, i - 1);
      }
    }
    stack.push({ indent, line: i });
  });

  while (stack.length > 0) {
      const top = stack.pop()!;
      regions.set(top.line, lines.length - 1);
  }

  const validRegions = new Map<number, number>();
  regions.forEach((end, start) => {
      if (end > start) validRegions.set(start, end);
  });
  
  return validRegions;
};

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, disabled, language = 'python' }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  
  const [foldedLines, setFoldedLines] = useState<Set<number>>(new Set());
  const [isMaximized, setIsMaximized] = useState(false);
  
  const regions = useMemo(() => detectRegions(value), [value]);

  const { visibleCode, lineMap, hiddenBlocks } = useMemo(() => {
    const fullLines = value.split('\n');
    const visibleLines: string[] = [];
    const map: number[] = []; 
    const hidden: Map<number, string[]> = new Map();

    let i = 0;
    while (i < fullLines.length) {
      if (foldedLines.has(i) && regions.has(i)) {
        const end = regions.get(i)!;
        const header = fullLines[i];
        
        visibleLines.push(header + ' # ...');
        map.push(i);
        
        const block = fullLines.slice(i + 1, end + 1);
        hidden.set(visibleLines.length - 1, block);
        
        i = end + 1;
      } else {
        visibleLines.push(fullLines[i]);
        map.push(i);
        i++;
      }
    }

    return {
      visibleCode: visibleLines.join('\n'),
      lineMap: map,
      hiddenBlocks: hidden
    };
  }, [value, foldedLines, regions]);

  const handleScroll = useCallback(() => {
    if (textareaRef.current) {
      const { scrollTop, scrollLeft } = textareaRef.current;
      if (preRef.current) {
        preRef.current.scrollTop = scrollTop;
        preRef.current.scrollLeft = scrollLeft;
      }
      if (linesRef.current) {
        linesRef.current.scrollTop = scrollTop;
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVisibleCode = e.target.value;
    const newVisibleLines = newVisibleCode.split('\n');
    const oldVisibleLines = visibleCode.split('\n');
    
    let start = 0;
    while (
        start < oldVisibleLines.length && 
        start < newVisibleLines.length && 
        oldVisibleLines[start] === newVisibleLines[start]
    ) {
        start++;
    }

    let endOld = oldVisibleLines.length - 1;
    let endNew = newVisibleLines.length - 1;
    
    while (
        endOld >= start && 
        endNew >= start && 
        oldVisibleLines[endOld] === newVisibleLines[endNew]
    ) {
        endOld--;
        endNew--;
    }
    
    let newFullLines: string[] = [];
    
    for (let i = 0; i < start; i++) {
        const fullIdx = lineMap[i];
        newFullLines.push(value.split('\n')[fullIdx]);
        if (hiddenBlocks.has(i)) {
            newFullLines.push(...hiddenBlocks.get(i)!);
        }
    }

    for (let i = start; i <= endNew; i++) {
        let line = newVisibleLines[i];
        line = line.replace(/ # \.\.\.$/, ''); 
        newFullLines.push(line);
    }

    for (let i = endOld + 1; i < oldVisibleLines.length; i++) {
        const fullIdx = lineMap[i];
        newFullLines.push(value.split('\n')[fullIdx]);
        if (hiddenBlocks.has(i)) {
            newFullLines.push(...hiddenBlocks.get(i)!);
        }
    }

    const reconstructed = newFullLines.join('\n');
    
    const linesAddedInFull = newFullLines.length - value.split('\n').length;
    
    const safeThresholdBefore = start < lineMap.length ? lineMap[start] : value.split('\n').length;
    const safeThresholdAfter = (endOld + 1) < lineMap.length ? lineMap[endOld + 1] : value.split('\n').length;

    const newFolded = new Set<number>();
    foldedLines.forEach(lineIdx => {
        if (lineIdx < safeThresholdBefore) {
            newFolded.add(lineIdx);
        } else if (lineIdx >= safeThresholdAfter) {
            newFolded.add(lineIdx + linesAddedInFull);
        }
    });
    
    setFoldedLines(newFolded);
    onChange(reconstructed);
  };

  const toggleFold = (lineIndex: number) => {
    const fullIndex = lineMap[lineIndex];
    if (fullIndex === undefined) return;

    const newFolded = new Set(foldedLines);
    if (newFolded.has(fullIndex)) {
      newFolded.delete(fullIndex);
    } else {
      newFolded.add(fullIndex);
    }
    setFoldedLines(newFolded);
  };

  const getHighlightedCode = (code: string) => {
    const codeToHighlight = code.endsWith('\n') ? code + ' ' : code;
    // @ts-ignore
    if (typeof window !== 'undefined' && window.Prism && window.Prism.languages[language]) {
        // @ts-ignore
       return window.Prism.highlight(codeToHighlight, window.Prism.languages[language], language);
    }
    return codeToHighlight.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  const visibleLinesArr = visibleCode.split('\n');

  return (
    <div 
      className={`relative font-mono text-sm border border-slate-700 rounded-xl overflow-hidden bg-[#0d1117] group focus-within:ring-2 focus-within:ring-magma-500/50 focus-within:border-magma-500 transition-all shadow-inner 
      ${isMaximized ? 'fixed inset-4 z-[60] h-[calc(100vh-2rem)] shadow-2xl' : 'h-[600px]'}`}
    >
      
      {/* Controls Overlay */}
      <div className="absolute top-2 right-4 z-50 flex items-center gap-2">
         <button 
           onClick={() => setIsMaximized(!isMaximized)}
           className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white rounded-md backdrop-blur border border-slate-700 transition-colors"
           title={isMaximized ? "Minimize" : "Maximize Editor"}
         >
            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
         </button>
      </div>

      {/* Gutter */}
      <div 
        ref={linesRef}
        className="absolute left-0 top-0 bottom-0 w-12 bg-[#0d1117] border-r border-slate-800/50 text-slate-600 select-none overflow-hidden z-20"
      >
        <div className="pt-4 pb-4">
            {visibleLinesArr.map((_, i) => {
                const fullIndex = lineMap[i];
                const canFold = regions.has(fullIndex);
                const isFolded = foldedLines.has(fullIndex);
                
                return (
                    <div key={i} className="leading-6 h-6 flex items-center pr-1 relative group/line">
                         <span className="flex-1 text-right text-xs mr-1 opacity-50 group-hover/line:opacity-100 transition-opacity">
                            {fullIndex + 1}
                         </span>
                         
                         <div className="w-4 h-4 flex items-center justify-center cursor-pointer hover:text-magma-500"
                              onMouseDown={(e) => { e.preventDefault(); toggleFold(i); }}
                         >
                             {canFold && (
                                 isFolded 
                                 ? <ChevronRight className="w-3 h-3" /> 
                                 : <ChevronDown className="w-3 h-3 opacity-0 group-hover/line:opacity-100" />
                             )}
                         </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Editor Area */}
      <div className="absolute top-0 bottom-0 right-0 left-12 bg-[#0d1117]">
          <pre
            ref={preRef}
            aria-hidden="true"
            className="absolute inset-0 m-0 p-4 pointer-events-none overflow-hidden whitespace-pre font-mono leading-6 text-slate-300"
            style={{ 
                fontFamily: '"JetBrains Mono", monospace', 
                tabSize: 4,
                backgroundColor: 'transparent' 
            }}
            dangerouslySetInnerHTML={{ __html: getHighlightedCode(visibleCode) }}
          />

          <textarea
            ref={textareaRef}
            value={visibleCode}
            onChange={handleChange}
            onScroll={handleScroll}
            disabled={disabled}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="absolute inset-0 w-full h-full m-0 p-4 bg-transparent text-transparent caret-white resize-none border-none outline-none whitespace-pre overflow-auto font-mono leading-6 z-10 custom-scrollbar disabled:cursor-not-allowed"
            style={{ fontFamily: '"JetBrains Mono", monospace', tabSize: 4 }}
          />
      </div>
      
      {disabled && <div className="absolute inset-0 bg-slate-950/50 z-30 cursor-not-allowed" />}
    </div>
  );
};
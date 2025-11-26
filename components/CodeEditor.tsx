import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

// Helper to detect indentation-based regions (Python style)
const detectRegions = (code: string) => {
  const lines = code.split('\n');
  const regions = new Map<number, number>(); // startLine -> endLine
  const stack: { indent: number; line: number }[] = [];

  lines.forEach((line, i) => {
    // Skip empty lines for indentation calculation, but they are part of blocks
    if (!line.trim()) return;

    const indent = line.search(/\S|$/);
    
    // Check stack for closed regions
    while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
      const top = stack.pop()!;
      if (top.indent > indent) {
         // This block has ended. The previous line was the last line of the block.
         // However, purely empty lines might separate blocks.
         // A simple heuristic: end at i - 1.
         regions.set(top.line, i - 1);
      }
    }
    
    // Check if this line starts a new block (indented more than parent)
    // Actually, in Python, a block starts after a colon and indentation increase.
    // We just look for the next line being indented more.
    // So we push every line to stack as a potential parent? No.
    // We push if it *could* be a parent.
    // Simpler: Just push every non-empty line with its indent.
    stack.push({ indent, line: i });
  });

  // Close remaining blocks at the end of file
  while (stack.length > 0) {
      const top = stack.pop()!;
      regions.set(top.line, lines.length - 1);
  }

  // Filter trivial regions (single line)
  const validRegions = new Map<number, number>();
  regions.forEach((end, start) => {
      if (end > start) validRegions.set(start, end);
  });
  
  return validRegions;
};

export const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, disabled }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const linesRef = useRef<HTMLDivElement>(null);
  
  // State for folded lines (start line indices)
  const [foldedLines, setFoldedLines] = useState<Set<number>>(new Set());
  
  // Memoized regions detection
  const regions = useMemo(() => detectRegions(value), [value]);

  // Compute projection: Full Code -> Visible Code
  const { visibleCode, lineMap, hiddenBlocks } = useMemo(() => {
    const fullLines = value.split('\n');
    const visibleLines: string[] = [];
    const map: number[] = []; // visibleIndex -> fullIndex
    const hidden: Map<number, string[]> = new Map(); // visibleIndex -> hidden lines

    let i = 0;
    while (i < fullLines.length) {
      if (foldedLines.has(i) && regions.has(i)) {
        const end = regions.get(i)!;
        const header = fullLines[i];
        
        visibleLines.push(header + ' # ...');
        map.push(i);
        
        // Store hidden content
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

  // Sync scrolling
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

  // Handle Edits
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newVisibleCode = e.target.value;
    const newVisibleLines = newVisibleCode.split('\n');
    const oldVisibleLines = visibleCode.split('\n');
    
    // 1. Identify the range of change in visible lines
    // Simple diff: find first changed line index and last changed line index
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
    
    // 2. Reconstruct Full Code
    let newFullLines: string[] = [];
    
    // Part A: Unchanged Prefix
    for (let i = 0; i < start; i++) {
        const fullIdx = lineMap[i];
        newFullLines.push(value.split('\n')[fullIdx]);
        // If this line was folded, append its hidden block
        if (hiddenBlocks.has(i)) {
            newFullLines.push(...hiddenBlocks.get(i)!);
        }
    }

    // Part B: The Changed Section (New Content)
    // Note: We intentionally discard the hidden blocks associated with deleted/modified lines in the range [start, endOld]
    for (let i = start; i <= endNew; i++) {
        let line = newVisibleLines[i];
        // If user didn't modify the placeholder " # ...", we could try to preserve folding?
        // But simplifying: any edit to a folded line unfolds it or deletes the block if line deleted.
        // Special case: If the user just pressed enter at the end of a folded line, 
        // they might want to keep the fold. This is getting complex.
        // Current behavior: If you touch the folded line, you lose the hidden block (it's deleted).
        // Except: if we can map it back to an existing hidden block by index?
        // Risky. Let's strip the visual artifact if present to be clean.
        line = line.replace(/ # \.\.\.$/, ''); 
        newFullLines.push(line);
    }

    // Part C: Unchanged Suffix
    for (let i = endOld + 1; i < oldVisibleLines.length; i++) {
        const fullIdx = lineMap[i];
        newFullLines.push(value.split('\n')[fullIdx]);
        if (hiddenBlocks.has(i)) {
            newFullLines.push(...hiddenBlocks.get(i)!);
        }
    }

    const reconstructed = newFullLines.join('\n');
    
    // 3. Update Folded State (Shift indices)
    // We need to know how many lines were inserted/removed in the Full Code before each existing fold.
    // This is hard to do perfectly in one pass without more complex tracking.
    // Safe fallback: Clear folds that were involved in the edit, shift others.
    // For now, to keep it robust: We will just reset folds if structure changes drastically? 
    // No, that's annoying.
    // Let's try to preserve folds that are strictly AFTER the edit.
    
    const linesAddedInFull = newFullLines.length - value.split('\n').length;
    // The visual change `start` corresponds to `lineMap[start]` in full code.
    // Any fold index < lineMap[start] is safe.
    // Any fold index > lineMap[endOld] needs to be shifted by `linesAddedInFull`.
    
    const safeThresholdBefore = start < lineMap.length ? lineMap[start] : value.split('\n').length;
    // For suffix, we find the full-index of the first line in suffix
    const safeThresholdAfter = (endOld + 1) < lineMap.length ? lineMap[endOld + 1] : value.split('\n').length;

    const newFolded = new Set<number>();
    foldedLines.forEach(lineIdx => {
        if (lineIdx < safeThresholdBefore) {
            newFolded.add(lineIdx);
        } else if (lineIdx >= safeThresholdAfter) {
            newFolded.add(lineIdx + linesAddedInFull);
        }
        // Folds inside the edited region are lost (unfolded/deleted).
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
    if (typeof window !== 'undefined' && (window as any).Prism && (window as any).Prism.languages.python) {
       return (window as any).Prism.highlight(codeToHighlight, (window as any).Prism.languages.python, 'python');
    }
    return codeToHighlight.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  };

  const visibleLinesArr = visibleCode.split('\n');

  return (
    <div className="relative font-mono text-sm h-[600px] border border-slate-700 rounded-xl overflow-hidden bg-[#0d1117] group focus-within:ring-2 focus-within:ring-magma-500/50 focus-within:border-magma-500 transition-all shadow-inner">
      
      {/* Gutter (Line Numbers + Fold Icons) */}
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
                         {/* Line Number */}
                         <span className="flex-1 text-right text-xs mr-1 opacity-50 group-hover/line:opacity-100 transition-opacity">
                            {fullIndex + 1}
                         </span>
                         
                         {/* Fold Icon */}
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
          {/* Highlight Layer */}
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

          {/* Input Layer */}
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
      
      {/* Loading Overlay State for disabled */}
      {disabled && <div className="absolute inset-0 bg-slate-950/50 z-30 cursor-not-allowed" />}
    </div>
  );
};

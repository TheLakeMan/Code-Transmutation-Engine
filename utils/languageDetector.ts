
import { Language } from '../types';

export const detectLanguage = (code: string): Language => {
  if (!code || !code.trim()) return 'python';

  const heuristicScore: Record<Language, number> = {
    python: 0, javascript: 0, typescript: 0, markdown: 0, json: 0,
    c: 0, cpp: 0, java: 0, ruby: 0, go: 0, rust: 0
  };

  // Python
  if (/def\s+\w+\s*\(/.test(code)) heuristicScore.python += 5;
  if (/import\s+[\w.]+/.test(code)) heuristicScore.python += 2;
  if (/from\s+[\w.]+\s+import/.test(code)) heuristicScore.python += 3;
  if (/#\s/.test(code)) heuristicScore.python += 1;
  if (/:\s*$/.test(code)) heuristicScore.python += 2;

  // JavaScript/TypeScript
  if (/const\s+\w+\s*=/.test(code)) heuristicScore.javascript += 3;
  if (/let\s+\w+\s*=/.test(code)) heuristicScore.javascript += 3;
  if (/function\s+\w+\s*\(/.test(code)) heuristicScore.javascript += 3;
  if (/console\.log/.test(code)) heuristicScore.javascript += 2;
  if (/import\s+.*\s+from/.test(code)) heuristicScore.javascript += 2;
  if (/=>/.test(code)) heuristicScore.javascript += 2;

  // TypeScript specific
  if (/:\s*(string|number|boolean|any|void|interface|type)\b/.test(code)) heuristicScore.typescript += 5;
  if (/interface\s+\w+/.test(code)) heuristicScore.typescript += 4;
  if (/<[A-Z]\w*>/.test(code)) heuristicScore.typescript += 2; // Generics

  // C/C++
  if (/#include\s+<stdio\.h>/.test(code)) heuristicScore.c += 10;
  if (/#include\s+<iostream>/.test(code)) heuristicScore.cpp += 10;
  if (/int\s+main\s*\(/.test(code)) { heuristicScore.c += 3; heuristicScore.cpp += 3; }
  if (/printf\s*\(/.test(code)) heuristicScore.c += 3;
  if (/std::/.test(code)) heuristicScore.cpp += 5;
  if (/cout\s*<</.test(code)) heuristicScore.cpp += 5;
  if (/\w+\s*\*/.test(code)) { heuristicScore.c += 2; heuristicScore.cpp += 2; } // Pointers

  // Java
  if (/public\s+class\s+\w+/.test(code)) heuristicScore.java += 5;
  if (/public\s+static\s+void\s+main/.test(code)) heuristicScore.java += 5;
  if (/System\.out\.println/.test(code)) heuristicScore.java += 5;
  if (/package\s+[\w.]+;/.test(code)) heuristicScore.java += 3;

  // Ruby
  if (/def\s+\w+/.test(code)) heuristicScore.ruby += 2;
  if (/end\s*$/.test(code)) heuristicScore.ruby += 2;
  if (/class\s+\w+/.test(code)) heuristicScore.ruby += 1;
  if (/require\s+['"]/.test(code)) heuristicScore.ruby += 2;
  if (/@\w+/.test(code)) heuristicScore.ruby += 2; // Instance vars

  // Go
  if (/func\s+\w+/.test(code)) heuristicScore.go += 5;
  if (/package\s+main/.test(code)) heuristicScore.go += 5;
  if (/fmt\.Println/.test(code)) heuristicScore.go += 3;
  if (/:=/.test(code)) heuristicScore.go += 3;

  // Rust
  if (/fn\s+\w+/.test(code)) heuristicScore.rust += 5;
  if (/let\s+mut\s+/.test(code)) heuristicScore.rust += 5;
  if (/println!/.test(code)) heuristicScore.rust += 5;
  if (/match\s+\w+/.test(code)) heuristicScore.rust += 2;
  if (/->/.test(code)) heuristicScore.rust += 2;

  // Resolve TS vs JS overlap
  heuristicScore.typescript += heuristicScore.javascript;
  
  // Find max
  let maxScore = 0;
  let detected: Language = 'python';

  for (const [lang, score] of Object.entries(heuristicScore)) {
      if (score > maxScore) {
          maxScore = score;
          detected = lang as Language;
      }
  }

  return maxScore > 0 ? detected : 'python';
};

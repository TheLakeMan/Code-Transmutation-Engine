
import { CycleMetrics } from '../types';

// Alias for clarity when comparing before/after states
export type CodeMetrics = CycleMetrics;

// Exported for use in visualizations
export const calcEntropy = (str: string) => {
  if (!str) return 0;
  const len = str.length;
  // Heuristic: specific characters and randomness approximation
  const specialChars = (str.match(/[^a-zA-Z0-9\s]/g) || []).length;
  // Normalize somewhat arbitrarily to 0-1 range for code
  return Math.min(1.0, (specialChars / len) * 4);
};

export const calcComplexity = (str: string) => {
  // Count control flow keywords and structural elements
  const keywords = (str.match(/\b(if|for|while|switch|case|return|=>|function|class|def|match|try|catch|async|await|public|private|static|void|int|struct|impl)\b/g) || []).length;
  const indentDepth = str.split('\n').reduce((max, line) => {
    const spaces = line.search(/\S/);
    return spaces > max ? spaces : max;
  }, 0);
  return keywords + (indentDepth / 4);
};

export const calcSimilarity = (s1: string, s2: string) => {
  if (!s1 || !s2) return 0;
  // Jaccard similarity on tokens
  // Split by non-word characters to get tokens
  const tokenize = (text: string) => new Set(text.split(/[^a-zA-Z0-9_]+/).filter(x => x.length > 1));
  
  const t1 = tokenize(s1);
  const t2 = tokenize(s2);
  
  if (t1.size === 0 && t2.size === 0) return 1;
  if (t1.size === 0 || t2.size === 0) return 0;

  const intersection = new Set([...t1].filter(x => t2.has(x)));
  const union = new Set([...t1, ...t2]);
  
  return intersection.size / union.size;
};

export const calculateMetrics = (heatCode: string, coolCode: string): CycleMetrics => {
  const heatLines = heatCode.split('\n').length;
  const coolLines = coolCode.split('\n').length;

  return {
    heatEntropy: calcEntropy(heatCode),
    coolStability: 1.0 - calcEntropy(coolCode) * 0.8, // Inverse of entropy, dampened
    complexity: calcComplexity(coolCode),
    convergence: calcSimilarity(heatCode, coolCode), // Similarity between the hallucination and the fix
    deltaLines: coolLines - heatLines
  };
};

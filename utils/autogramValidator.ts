
export interface AutogramReportData {
  valid: boolean;
  report: Record<string, { claimed: number; actual: number }>;
}

export const validateAutogram = (sentence: string): AutogramReportData => {
  const claimed: Record<string, number> = {};
  
  // Normalize sentence
  const cleanSentence = sentence.toLowerCase().replace(/[^a-z\s]/g, "");
  const parts = cleanSentence.split(/\s+/).filter(p => p);

  const numMap: Record<string, number> = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10
  };

  // Heuristic parsing for "number letter" pairs (e.g., "five e")
  // We look for patterns where a number word is immediately followed by a single letter
  for (let i = 0; i < parts.length - 1; i++) {
    const word = parts[i];
    const nextWord = parts[i+1];
    
    if (numMap[word] && nextWord.length === 1 && /^[a-z]$/.test(nextWord)) {
       claimed[nextWord] = numMap[word];
       // Skip the letter so we don't process it as a number start
       i++; 
    }
  }

  // Actual counts (strict: all letters)
  const actual: Record<string, number> = {};
  for (const char of sentence.toLowerCase()) {
    if (/[a-z]/.test(char)) {
      actual[char] = (actual[char] || 0) + 1;
    }
  }

  // Build report for all letters a-z
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const fullReport: Record<string, { claimed: number; actual: number }> = {};
  
  let isValid = true;

  alphabet.forEach(letter => {
    const c = claimed[letter] || 0;
    const a = actual[letter] || 0;
    fullReport[letter] = { claimed: c, actual: a };
    if (c !== a) isValid = false;
  });

  return { valid: isValid, report: fullReport };
};
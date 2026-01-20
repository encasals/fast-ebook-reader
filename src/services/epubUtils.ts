import type { RSVPWord } from '@/types';

/**
 * Calculates the Optimal Recognition Point (ORP) pivot index for a word.
 * The pivot is the letter where the eye naturally focuses for fastest recognition.
 * Only letters are counted for the calculation, special characters are ignored.
 * 
 * Rules based on letter count:
 * - 1 letter: pivot at letter index 0
 * - 2-5 letters: pivot at letter index 1
 * - 6-9 letters: pivot at letter index 2
 * - 10-13 letters: pivot at letter index 3
 * - 14+ letters: pivot at letter index 4
 * 
 * Returns the actual index in the original word string.
 */
export const calculatePivotIndex = (word: string): number => {
  // Find all letter positions in the word
  const letterIndices: number[] = [];
  for (let i = 0; i < word.length; i++) {
    if (/\p{L}/u.test(word[i])) {
      letterIndices.push(i);
    }
  }
  
  const letterCount = letterIndices.length;
  
  // If no letters, return 0
  if (letterCount === 0) return 0;
  
  // Determine which letter should be the pivot based on letter count
  let pivotLetterIndex: number;
  if (letterCount <= 1) pivotLetterIndex = 0;
  else if (letterCount <= 5) pivotLetterIndex = 1;
  else if (letterCount <= 9) pivotLetterIndex = 2;
  else if (letterCount <= 13) pivotLetterIndex = 3;
  else pivotLetterIndex = 4;
  
  // Return the actual position in the original string
  return letterIndices[pivotLetterIndex];
};

/**
 * Splits a word into three parts: before pivot, pivot letter, and after pivot.
 */
export const splitWordAtPivot = (word: string): RSVPWord => {
  const cleanWord = word.trim();
  
  if (!cleanWord) {
    return { word: '', beforePivot: '', pivot: '', afterPivot: '', pivotIndex: 0 };
  }

  const pivotIndex = calculatePivotIndex(cleanWord);
  
  return {
    word: cleanWord,
    beforePivot: cleanWord.slice(0, pivotIndex),
    pivot: cleanWord[pivotIndex] || '',
    afterPivot: cleanWord.slice(pivotIndex + 1),
    pivotIndex
  };
};

/**
 * Cleans and normalizes text extracted from EPUB.
 * Removes extra whitespace, HTML entities, and normalizes characters.
 */
export const cleanText = (text: string): string => {
  return text
    // Remove HTML tags if any remain
    .replace(/<[^>]*>/g, ' ')
    // Decode common HTML entities
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '...')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Remove leading/trailing whitespace
    .trim();
};

/**
 * Tokenizes text into an array of words.
 * Preserves punctuation attached to words.
 */
export const tokenizeText = (text: string): string[] => {
  const cleaned = cleanText(text);
  
  if (!cleaned) return [];
  
  // Split by whitespace and filter empty strings
  return cleaned.split(/\s+/).filter(word => word.length > 0);
};

/**
 * Calculates the delay between words based on WPM.
 * Returns delay in milliseconds.
 */
export const calculateWordDelay = (wpm: number): number => {
  // WPM = words per minute
  // Delay = 60000ms / WPM
  return Math.round(60000 / wpm);
};

/**
 * Adjusts delay for word complexity (punctuation, length).
 * Longer words and sentences endings get slightly more time.
 * 
 * Punctuation pause multipliers:
 * - Ellipsis (...): +100% (longest pause for dramatic effect)
 * - Period/exclamation/question: +75% (end of sentence)
 * - Colon/semicolon: +50% (major pause)
 * - Comma: +30% (minor pause)
 * - Long words (>12 chars): +20%
 */
export const getAdjustedDelay = (word: string, baseDelay: number): number => {
  let multiplier = 1;
  
  // Check for ellipsis first (longest pause) - handles both '...' and '…'
  if (/\.{3}$/.test(word) || /…$/.test(word)) {
    multiplier += 1.5;
  }
  // Add pause for sentence endings (period, exclamation, question mark)
  // But not if it's an ellipsis (already handled above)
  else if (/[.!?]$/.test(word)) {
    multiplier += 1.5;
  }
  // Add pause for colon and semicolon (major grammatical pauses)
  else if (/[;:]$/.test(word)) {
    multiplier += 1.25;
  }
  // Add slight pause for comma (minor grammatical pause)
  else if (/,$/.test(word)) {
    multiplier += 1.25;
  }
  
  // Add pause for very long words (independent of punctuation)
  if (word.length > 12) {
    multiplier += 1.1;
  }
  
  return Math.round(baseDelay * multiplier);
};

/**
 * Formats time in seconds to mm:ss format.
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Estimates reading time based on word count and WPM.
 * Returns time in seconds.
 */
export const estimateReadingTime = (wordCount: number, wpm: number): number => {
  return Math.ceil((wordCount / wpm) * 60);
};

/**
 * Calculates progress percentage.
 */
export const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

import { useEffect, useRef, useCallback } from 'react';
import { useReaderStore } from '@/store/useReaderStore';
import { calculateWordDelay, getAdjustedDelay } from '@/services/epubUtils';

/**
 * Hook that manages the RSVP reading loop.
 * Controls the timed display of words based on WPM settings.
 */
export const useLiveReader = () => {
  const intervalRef = useRef<number | null>(null);
  
  const {
    isPlaying,
    currentWordIndex,
    words,
    wpm,
    nextWord,
    setIsPlaying,
    setCurrentWordIndex
  } = useReaderStore();

  const currentWord = words[currentWordIndex] || '';
  const hasMoreWords = currentWordIndex < words.length - 1;
  const progress = words.length > 0 ? (currentWordIndex / words.length) * 100 : 0;

  // Clear interval helper
  const clearCurrentInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Manual word update function
  const updateCurrentWord = useCallback((index: number) => {
    if (index >= 0 && index < words.length) {
      setCurrentWordIndex(index);
      // If currently playing, restart the timer from the new position
      if (isPlaying) {
        clearCurrentInterval();
        // Small delay to allow state to update, then restart
        setTimeout(() => {
          if (useReaderStore.getState().isPlaying) {
            const baseDelay = calculateWordDelay(wpm);
            const word = words[index];
            const delay = getAdjustedDelay(word, baseDelay);
            
            intervalRef.current = window.setTimeout(() => {
              const state = useReaderStore.getState();
              if (state.isPlaying && state.currentWordIndex < state.words.length - 1) {
                nextWord();
              } else {
                setIsPlaying(false);
              }
            }, delay);
          }
        }, 10);
      }
    }
  }, [words.length, isPlaying, wpm, clearCurrentInterval, setCurrentWordIndex, nextWord, setIsPlaying]);

  // Main reading loop
  useEffect(() => {
    if (!isPlaying || words.length === 0) {
      clearCurrentInterval();
      return;
    }

    const baseDelay = calculateWordDelay(wpm);
    
    const tick = () => {
      const word = words[useReaderStore.getState().currentWordIndex];
      if (!word) {
        setIsPlaying(false);
        return;
      }

      // Schedule next word with adjusted delay
      const delay = getAdjustedDelay(word, baseDelay);
      
      intervalRef.current = window.setTimeout(() => {
        const state = useReaderStore.getState();
        if (state.isPlaying && state.currentWordIndex < state.words.length - 1) {
          nextWord();
          tick();
        } else {
          setIsPlaying(false);
        }
      }, delay);
    };

    tick();

    return () => clearCurrentInterval();
  }, [isPlaying, wpm, words.length, clearCurrentInterval, nextWord, setIsPlaying]);

  // Cleanup on unmount
  useEffect(() => {
    return () => clearCurrentInterval();
  }, [clearCurrentInterval]);

  return {
    currentWord,
    currentWordIndex,
    totalWords: words.length,
    progress,
    hasMoreWords,
    isPlaying,
    updateCurrentWord
  };
};

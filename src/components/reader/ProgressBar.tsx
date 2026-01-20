import React from 'react';
import { useReaderStore } from '@/store/useReaderStore';
import { formatTime, estimateReadingTime, calculateProgress } from '@/services/epubUtils';

export const ProgressBar = () => {
  const { currentWordIndex, words, wpm, setCurrentWordIndex } = useReaderStore();
  
  const progress = calculateProgress(currentWordIndex, words.length);
  const remainingWords = words.length - currentWordIndex;
  const remainingTime = estimateReadingTime(remainingWords, wpm);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.floor(percentage * words.length);
    setCurrentWordIndex(Math.min(Math.max(newIndex, 0), words.length - 1));
  };

  return (
    <div className="w-full px-4 py-2 bg-theme">
      <div className="max-w-4xl mx-auto">
        {/* Progress bar */}
        <div 
          className="relative h-2 bg-theme-accent rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary-700 to-pivot rounded-full transition-all duration-150"
            style={{ width: `${progress}%` }}
          />
          
          {/* Hover indicator */}
          <div className="absolute inset-0 hover:bg-black/5 dark:hover:bg-white/10 transition-colors" />
        </div>

        {/* Progress info */}
        <div className="flex justify-between items-center mt-1 text-xs text-theme-muted">
          <span>{progress}% complete</span>
          <span>{formatTime(remainingTime)} remaining</span>
        </div>
      </div>
    </div>
  );
}

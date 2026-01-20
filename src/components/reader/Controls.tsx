import React from 'react';
import { useReaderStore } from '@/store/useReaderStore';

interface ControlsProps {
  onBack?: () => void;
}

export const Controls = ({ onBack }: ControlsProps) => {
  const {
    isPlaying,
    togglePlayPause,
    wpm,
    setWpm,
    currentWordIndex,
    words,
    setCurrentWordIndex,
    previousWord,
    nextWord,
    settings,
    updateSettings
  } = useReaderStore();

  const handleWpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 100 && value <= 1000) {
      setWpm(value);
    }
  };

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.min(Math.max(settings.fontSize + delta, 24), 96);
    updateSettings({ fontSize: newSize });
  };

  const handleSkip = (amount: number) => {
    const newIndex = Math.min(Math.max(currentWordIndex + amount, 0), words.length - 1);
    setCurrentWordIndex(newIndex);
  };

  return (
    <div className="bg-theme-surface border-t border-theme p-4">
      <div className="max-w-4xl mx-auto">
        {/* Main Controls Row */}
        <div className="flex items-center justify-center gap-4 mb-4">
          {/* Back Button */}
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 text-theme-muted hover:text-theme transition-colors"
              aria-label="Back to library"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}

          {/* Skip Back */}
          <button
            onClick={() => handleSkip(-10)}
            className="p-2 text-theme-muted hover:text-theme transition-colors"
            aria-label="Skip back 10 words"
            disabled={currentWordIndex === 0}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>

          {/* Previous Word */}
          <button
            onClick={previousWord}
            className="p-2 text-theme-muted hover:text-theme transition-colors"
            aria-label="Previous word"
            disabled={currentWordIndex === 0}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlayPause}
            className="p-4 bg-primary-700 hover:bg-primary-800 rounded-full text-white transition-colors shadow-lg shadow-primary-700/30"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>

          {/* Next Word */}
          <button
            onClick={nextWord}
            className="p-2 text-theme-muted hover:text-theme transition-colors"
            aria-label="Next word"
            disabled={currentWordIndex >= words.length - 1}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Skip Forward */}
          <button
            onClick={() => handleSkip(10)}
            className="p-2 text-theme-muted hover:text-theme transition-colors"
            aria-label="Skip forward 10 words"
            disabled={currentWordIndex >= words.length - 1}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>

        {/* Settings Row */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          {/* WPM Control */}
          <div className="flex items-center gap-3">
            <label htmlFor="wpm" className="text-theme-muted">WPM:</label>
            <input
              id="wpm"
              type="range"
              min="100"
              max="1000"
              step="25"
              value={wpm}
              onChange={handleWpmChange}
              className="w-32"
            />
            <span className="text-theme font-mono w-12">{wpm}</span>
          </div>

          {/* Font Size Control */}
          <div className="flex items-center gap-2">
            <span className="text-theme-muted">Size:</span>
            <button
              onClick={() => handleFontSizeChange(-4)}
              className="p-1 text-theme-muted hover:text-theme transition-colors"
              aria-label="Decrease font size"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </button>
            <span className="text-theme font-mono w-8 text-center">{settings.fontSize}</span>
            <button
              onClick={() => handleFontSizeChange(4)}
              className="p-1 text-theme-muted hover:text-theme transition-colors"
              aria-label="Increase font size"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* Word Counter */}
          <div className="text-theme-muted">
            <span className="text-theme font-mono">{currentWordIndex + 1}</span>
            <span> / </span>
            <span className="font-mono">{words.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

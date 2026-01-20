import { useEffect, useState, useCallback, useRef } from 'react';
import { RSVPDisplay, Controls, ProgressBar } from '@/components/reader';
import { useReaderStore } from '@/store/useReaderStore';
import { useEpubParser } from '@/hooks/useEpubParser';
import { useLiveReader } from '@/hooks/useLiveReader';
import { usePersistedBook } from '@/hooks/usePersistedBook';
import { useWakeLock } from '@/hooks/useWakeLock';
import type { Book } from '@/types';

interface ReaderPageProps {
  book: Book | null;
  onBack: () => void;
}

export const ReaderPage = ({ book, onBack }: ReaderPageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isRestoringProgress, setIsRestoringProgress] = useState(false);
  const pendingWordIndexRef = useRef<number | null>(null);
  
  const { parseEpub, getChapterContent, findFirstChapterWithContent, chapters, metadata } = useEpubParser();
  const { saveProgress, getProgress } = usePersistedBook();
  const { currentWord, totalWords, updateCurrentWord } = useLiveReader();
  
  const {
    setWords,
    setChapters,
    setCurrentBook,
    setCurrentWordIndex,
    currentChapterIndex,
    setCurrentChapter,
    isPlaying,
    reset,
    settings,
    toggleTheme
  } = useReaderStore();

  // Keep screen awake while reading
  useWakeLock(isPlaying);

  // Load book and first chapter
  useEffect(() => {
    const loadBook = async () => {
      if (!book) {
        onBack();
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Parse the EPUB
        const { chapters: parsedChapters } = await parseEpub(book.data);
        setCurrentBook(book.id);
        setChapters(parsedChapters);
        
        // Try to restore progress
        const progress = await getProgress(book.id);
        let chapterIdx = progress?.chapterIndex || 0;
        let words: string[] = [];
        
        console.log('Progress to restore:', progress);

        // Load chapter content
        console.log('Loading chapter', chapterIdx, 'of', parsedChapters.length);
        words = await getChapterContent(chapterIdx);
        console.log('Got words:', words.length);
        
        // If no content in saved chapter, find first chapter with content
        if (words.length === 0) {
          console.log('Chapter empty, searching for content...');
          const result = await findFirstChapterWithContent();
          chapterIdx = result.index;
          words = result.words;
          console.log('Found content in chapter', chapterIdx, 'with', words.length, 'words');
        }
        
        if (words.length > 0) {
          // Check if we're restoring to a saved chapter
          if (progress && progress.chapterIndex === chapterIdx && progress.wordIndex > 0) {
            // Restore word position, but make sure it's valid
            const restoredIndex = Math.min(progress.wordIndex, words.length - 1);
            console.log('Restoring progress: chapter', chapterIdx, 'word', restoredIndex, 'of', words.length);
            
            // Store the pending word index in a ref so the chapter effect can apply it
            pendingWordIndexRef.current = restoredIndex;
            setIsRestoringProgress(true);
            
            setWords(words);
            setCurrentChapter(chapterIdx);
          } else {
            setWords(words);
            setCurrentChapter(chapterIdx);
            console.log('Starting fresh at chapter', chapterIdx);
          }
        } else {
          setError('No readable content found in this book. The EPUB might be image-based or DRM protected.');
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load book';
        setError(message);
        console.error('Load book error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadBook();

    return () => {
      reset();
    };
  }, [book]);

  // Load chapter content when chapter changes (not on initial load)
  useEffect(() => {
    if (!initialLoadDone && chapters.length > 0) {
      setInitialLoadDone(true);
      return;
    }
    
    // Handle restoring progress - apply the pending word index
    if (isRestoringProgress) {
      if (pendingWordIndexRef.current !== null) {
        console.log('Applying pending word index:', pendingWordIndexRef.current);
        setCurrentWordIndex(pendingWordIndexRef.current);
        updateCurrentWord(pendingWordIndexRef.current);
        pendingWordIndexRef.current = null;
      }
      setIsRestoringProgress(false);
      return;
    }
    
    const loadChapter = async () => {
      if (chapters.length === 0 || !initialLoadDone) return;

      setIsLoading(true);
      setError(null);
      try {
        const words = await getChapterContent(currentChapterIndex);
        console.log('Loaded chapter', currentChapterIndex, 'with', words.length, 'words');
        if (words.length > 0) {
            console.log('Setting words for chapter', currentChapterIndex);
          setWords(words);
        //   setCurrentWordIndex(0); // Only reset to 0 when user manually changes chapter
        } else {
          // Chapter is empty (might be a cover page or image-only chapter)
          setError(`Chapter "${chapters[currentChapterIndex]?.title || currentChapterIndex}" has no readable text. Try another chapter.`);
        }
      } catch (err) {
        console.error('Error loading chapter:', err);
        setError('Error loading chapter content');
      } finally {
        setIsLoading(false);
      }
    }

    loadChapter();
  }, [currentChapterIndex, initialLoadDone, isRestoringProgress]);

  // Auto-save progress
  useEffect(() => {
    if (!book || !totalWords) return;

    const saveInterval = setInterval(() => {
      const state = useReaderStore.getState();
      saveProgress({
        bookId: book.id,
        cfi: '',
        wordIndex: state.currentWordIndex,
        chapterIndex: state.currentChapterIndex,
        totalWords: state.words.length
      });
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [book, saveProgress]);

  // Save progress immediately when pausing or when component unmounts
  const saveCurrentProgress = useCallback(() => {
    const state = useReaderStore.getState();
    if (book && state.words.length > 0) {
      saveProgress({
        bookId: book.id,
        cfi: '',
        wordIndex: state.currentWordIndex,
        chapterIndex: state.currentChapterIndex,
        totalWords: state.words.length
      });
      console.log('Progress saved: chapter', state.currentChapterIndex, 'word', state.currentWordIndex);
    }
  }, [book, saveProgress]);

  // Save when playback stops
  useEffect(() => {
    if (!isPlaying && book && totalWords > 0) {
      saveCurrentProgress();
    }
  }, [isPlaying, saveCurrentProgress]);

  // Save on page unload/close
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCurrentProgress();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Also save when component unmounts (going back to library)
      saveCurrentProgress();
    };
  }, [saveCurrentProgress]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        useReaderStore.getState().togglePlayPause();
      } else if (e.code === 'ArrowLeft') {
        useReaderStore.getState().previousWord();
      } else if (e.code === 'ArrowRight') {
        useReaderStore.getState().nextWord();
      } else if (e.code === 'Escape') {
        saveCurrentProgress(); // Save before going back
        onBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack, saveCurrentProgress]);

  const handleChapterChange = useCallback((index: number) => {
    saveCurrentProgress(); // Save progress before changing chapter
    setError(null);
    setCurrentChapter(index);
  }, [setCurrentChapter, saveCurrentProgress]);

  const handleBack = useCallback(() => {
    saveCurrentProgress();
    onBack();
  }, [onBack, saveCurrentProgress]);

  if (!book) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-theme-muted">No book selected</p>
      </div>
    );
  }

  // Only show full-page error if we have no chapters at all
  const isFatalError = error && chapters.length === 0;
  
  if (isFatalError) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="text-red-600 dark:text-red-500 text-lg max-w-md">{error}</div>
        <button 
          onClick={handleBack}
          className="text-theme-primary hover:underline"
        >
          Back to Library
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-theme">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 border-b border-theme bg-theme-surface">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={handleBack}
              className="p-2 text-theme-muted hover:text-theme transition-colors flex-shrink-0"
              aria-label="Back to library"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-medium text-theme truncate">
                {metadata?.title || book.title}
              </h1>
              <p className="text-xs text-theme-muted truncate">
                {metadata?.author || book.author}
              </p>
            </div>
          </div>

          {/* Chapter selector */}
          <div className="flex items-center gap-2">
            {chapters.length > 1 && (
              <select
                value={currentChapterIndex}
                onChange={(e) => handleChapterChange(parseInt(e.target.value, 10))}
                className="bg-theme-accent text-theme text-sm px-3 py-1.5 rounded-lg border border-theme focus:border-primary-700 focus:outline-none"
              >
                {chapters.map((chapter, index) => (
                  <option key={chapter.id} value={index}>
                    {chapter.title}
                  </option>
                ))}
              </select>
            )}
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-theme-accent hover:bg-theme-accent/80 text-theme-secondary transition-colors"
              aria-label={settings.theme === 'light' ? 'Switch to night mode' : 'Switch to light mode'}
              title={settings.theme === 'light' ? 'Night mode' : 'Light mode'}
            >
              {settings.theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <ProgressBar />

      {/* RSVP Display Area */}
      <main className="flex-1 relative overflow-hidden">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
              <p className="text-theme-muted">Loading chapter...</p>
            </div>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 p-4 text-center max-w-md">
              <div className="text-amber-600 dark:text-amber-500 text-base">{error}</div>
              <p className="text-theme-muted text-sm">Select a different chapter from the dropdown above.</p>
            </div>
          </div>
        ) : (
          <RSVPDisplay word={currentWord} />
        )}

        {/* Playing indicator */}
        {isPlaying && !error && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-2 text-xs text-theme-primary">
              <span className="w-2 h-2 bg-primary-700 rounded-full animate-pulse" />
              Reading
            </div>
          </div>
        )}
      </main>

      {/* Controls */}
      <Controls onBack={handleBack} />

      {/* Keyboard shortcuts hint */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-theme bg-theme">
        <p className="text-center text-xs text-theme-muted">
          <kbd className="px-1.5 py-0.5 bg-theme-accent rounded text-theme-secondary mx-1">Space</kbd> Play/Pause
          <kbd className="px-1.5 py-0.5 bg-theme-accent rounded text-theme-secondary mx-1 ml-4">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-theme-accent rounded text-theme-secondary mx-1">→</kbd> Navigate
          <kbd className="px-1.5 py-0.5 bg-theme-accent rounded text-theme-secondary mx-1 ml-4">Esc</kbd> Exit
        </p>
      </div>
    </div>
  );
}

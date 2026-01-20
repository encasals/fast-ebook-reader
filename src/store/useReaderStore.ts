import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReaderSettings, Chapter } from '@/types';

interface ReaderStore {
  // Playback state
  isPlaying: boolean;
  currentBookId: string | null;
  currentChapterIndex: number;
  currentWordIndex: number;
  
  // Content
  words: string[];
  chapters: Chapter[];
  
  // Settings
  wpm: number;
  settings: ReaderSettings;
  
  // Actions
  setIsPlaying: (isPlaying: boolean) => void;
  togglePlayPause: () => void;
  setCurrentBook: (bookId: string | null) => void;
  setCurrentChapter: (index: number) => void;
  setCurrentWordIndex: (index: number) => void;
  nextWord: () => void;
  previousWord: () => void;
  setWords: (words: string[], resetIndex?: boolean) => void;
  setChapters: (chapters: Chapter[]) => void;
  setWpm: (wpm: number) => void;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  toggleTheme: () => void;
  reset: () => void;
}

const defaultSettings: ReaderSettings = {
  wpm: 300,
  fontSize: 48,
  theme: 'light',
  fontFamily: 'JetBrains Mono'
};

export const useReaderStore = create<ReaderStore>()(
  persist(
    (set, get) => ({
      // Initial state
      isPlaying: false,
      currentBookId: null,
      currentChapterIndex: 0,
      currentWordIndex: 0,
      words: [],
      chapters: [],
      wpm: 300,
      settings: defaultSettings,

      // Actions
      setIsPlaying: (isPlaying) => set({ isPlaying }),
      
      togglePlayPause: () => set((state) => ({ isPlaying: !state.isPlaying })),
      
      setCurrentBook: (bookId) => set({ 
        currentBookId: bookId,
        currentChapterIndex: 0,
        currentWordIndex: 0,
        isPlaying: false
      }),
      
      setCurrentChapter: (index) => set({ 
        currentChapterIndex: index,
        currentWordIndex: 0,
        isPlaying: false
      }),
      
      setCurrentWordIndex: (index) => {
        console.log('Setting current word index to', index);
        set({ currentWordIndex: index })
      },
      
      nextWord: () => {
        const { currentWordIndex, words } = get();
        if (currentWordIndex < words.length - 1) {
          set({ currentWordIndex: currentWordIndex + 1 });
        } else {
          // End of chapter - stop playing
          set({ isPlaying: false });
        }
      },
      
      previousWord: () => {
        const { currentWordIndex } = get();
        if (currentWordIndex > 0) {
          set({ currentWordIndex: currentWordIndex - 1 });
        }
      },
      
      setWords: (words, resetIndex = false) => set({ 
        words, 
        ...(resetIndex && { currentWordIndex: 0 }) 
      }),
      
      setChapters: (chapters) => set({ chapters }),
      
      setWpm: (wpm) => set({ wpm, settings: { ...get().settings, wpm } }),
      
      updateSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
        wpm: newSettings.wpm ?? state.wpm
      })),
      
      toggleTheme: () => set((state) => ({
        settings: {
          ...state.settings,
          theme: state.settings.theme === 'light' ? 'dark' : 'light'
        }
      })),
      
      reset: () => set({
        isPlaying: false,
        currentBookId: null,
        currentChapterIndex: 0,
        currentWordIndex: 0,
        words: [],
        chapters: []
      })
    }),
    {
      name: 'fast-ebook-reader-storage',
      version: 1,
      partialize: (state) => ({
        wpm: state.wpm,
        settings: state.settings
      }),
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { wpm?: number; settings?: ReaderSettings };
        if (version === 0) {
          // Migration from v0: ensure theme is 'light' or 'dark'
          if (state.settings && state.settings.theme !== 'light' && state.settings.theme !== 'dark') {
            state.settings.theme = 'light';
          }
        }
        return state as { wpm: number; settings: ReaderSettings };
      }
    }
  )
);

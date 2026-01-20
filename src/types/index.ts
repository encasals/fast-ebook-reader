// Book interface - represents an EPUB stored in IndexedDB
export interface Book {
  id: string;
  title: string;
  author: string;
  cover?: Blob | null;
  coverUrl?: string;
  data: ArrayBuffer;
  addedAt: Date;
}

// Reading progress for a specific book
export interface ReadingProgress {
  bookId: string;
  cfi: string; // EPUB CFI location
  wordIndex: number; // Current word index for RSVP mode
  chapterIndex: number;
  totalWords: number;
  lastReadAt: Date;
}

// Reader settings
export interface ReaderSettings {
  wpm: number; // Words per minute
  fontSize: number;
  theme: 'light' | 'dark';
  fontFamily: string;
}

// Chapter data extracted from EPUB
export interface Chapter {
  id: string;
  title: string;
  href: string;
  content: string;
  words: string[];
}

// Word with pivot calculation for RSVP display
export interface RSVPWord {
  word: string;
  beforePivot: string;
  pivot: string;
  afterPivot: string;
  pivotIndex: number;
}

// Reader state
export interface ReaderState {
  isPlaying: boolean;
  currentBookId: string | null;
  currentChapterIndex: number;
  currentWordIndex: number;
  wpm: number;
  words: string[];
  chapters: Chapter[];
  settings: ReaderSettings;
}

// Library state
export interface LibraryState {
  books: Book[];
  isLoading: boolean;
  error: string | null;
}

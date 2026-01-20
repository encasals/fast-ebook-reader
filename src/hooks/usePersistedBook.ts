import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { dbHelpers } from '@/services/db';
import type { Book, ReadingProgress } from '@/types';

interface UsePersistedBookResult {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  addBook: (file: File, metadata: { title: string; author: string; cover?: Blob | null }) => Promise<Book>;
  getBook: (id: string) => Promise<Book | undefined>;
  deleteBook: (id: string) => Promise<void>;
  saveProgress: (progress: Omit<ReadingProgress, 'lastReadAt'>) => Promise<void>;
  getProgress: (bookId: string) => Promise<ReadingProgress | undefined>;
  refreshBooks: () => Promise<void>;
}

/**
 * Hook for managing persisted books and reading progress in IndexedDB.
 */
export const usePersistedBook = (): UsePersistedBookResult => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all books on mount
  const refreshBooks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allBooks = await dbHelpers.getAllBooks();
      
      // Generate cover URLs for books with cover blobs
      const booksWithUrls = allBooks.map(book => ({
        ...book,
        coverUrl: book.cover ? URL.createObjectURL(book.cover) : undefined
      }));
      
      setBooks(booksWithUrls);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load books';
      setError(message);
      console.error('Error loading books:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshBooks();
    
    // Cleanup cover URLs on unmount
    return () => {
      books.forEach(book => {
        if (book.coverUrl) {
          URL.revokeObjectURL(book.coverUrl);
        }
      });
    };
  }, []);

  const addBook = useCallback(async (
    file: File, 
    metadata: { title: string; author: string; cover?: Blob | null }
  ): Promise<Book> => {
    const arrayBuffer = await file.arrayBuffer();
    
    const book: Book = {
      id: uuidv4(),
      title: metadata.title,
      author: metadata.author,
      cover: metadata.cover || null,
      data: arrayBuffer,
      addedAt: new Date()
    };
    
    await dbHelpers.addBook(book);
    await refreshBooks();
    
    return book;
  }, [refreshBooks]);

  const getBook = useCallback(async (id: string): Promise<Book | undefined> => {
    return await dbHelpers.getBook(id);
  }, []);

  const deleteBook = useCallback(async (id: string): Promise<void> => {
    await dbHelpers.deleteBook(id);
    await refreshBooks();
  }, [refreshBooks]);

  const saveProgress = useCallback(async (
    progress: Omit<ReadingProgress, 'lastReadAt'>
  ): Promise<void> => {
    await dbHelpers.saveProgress({
      ...progress,
      lastReadAt: new Date()
    });
  }, []);

  const getProgress = useCallback(async (bookId: string): Promise<ReadingProgress | undefined> => {
    return await dbHelpers.getProgress(bookId);
  }, []);

  return {
    books,
    isLoading,
    error,
    addBook,
    getBook,
    deleteBook,
    saveProgress,
    getProgress,
    refreshBooks
  };
}

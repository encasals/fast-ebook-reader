import Dexie, { type Table } from 'dexie';
import type { Book, ReadingProgress } from '@/types';

export class FastEbookReaderDB extends Dexie {
  books!: Table<Book, string>;
  progress!: Table<ReadingProgress, string>;

  constructor() {
    super('FastEbookReaderDB');
    
    this.version(1).stores({
      books: 'id, title, author, addedAt',
      progress: 'bookId, lastReadAt'
    });
  }
}

export const db = new FastEbookReaderDB();

// Helper functions for database operations
export const dbHelpers = {
  // Books
  async addBook(book: Book): Promise<string> {
    return await db.books.add(book);
  },

  async getBook(id: string): Promise<Book | undefined> {
    return await db.books.get(id);
  },

  async getAllBooks(): Promise<Book[]> {
    return await db.books.orderBy('addedAt').reverse().toArray();
  },

  async deleteBook(id: string): Promise<void> {
    await db.books.delete(id);
    await db.progress.delete(id);
  },

  async updateBook(id: string, updates: Partial<Book>): Promise<void> {
    await db.books.update(id, updates);
  },

  // Progress
  async saveProgress(progress: ReadingProgress): Promise<void> {
    await db.progress.put(progress);
  },

  async getProgress(bookId: string): Promise<ReadingProgress | undefined> {
    return await db.progress.get(bookId);
  },

  async deleteProgress(bookId: string): Promise<void> {
    await db.progress.delete(bookId);
  }
};

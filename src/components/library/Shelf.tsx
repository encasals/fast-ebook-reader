
import type { Book } from '@/types';
import { BookCard } from './BookCard';

interface ShelfProps {
  books: Book[];
  onOpenBook: (book: Book) => void;
  onDeleteBook: (book: Book) => void;
  isLoading?: boolean;
}

export const Shelf = ({ books, onOpenBook, onDeleteBook, isLoading }: ShelfProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-12 h-12 border-4 border-primary-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-6 rounded-full bg-theme-surface mb-6">
          <svg className="w-16 h-16 text-theme-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-theme mb-2">Your library is empty</h3>
        <p className="text-theme-muted max-w-sm">
          Drop an EPUB file above to start reading at lightning speed!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {books.map((book) => (
        <BookCard
          key={book.id}
          book={book}
          onOpen={onOpenBook}
          onDelete={onDeleteBook}
        />
      ))}
    </div>
  );
}

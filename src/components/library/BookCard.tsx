import React from 'react';
import type { Book } from '@/types';

interface BookCardProps {
  book: Book;
  onOpen: (book: Book) => void;
  onDelete: (book: Book) => void;
}

export const BookCard = ({ book, onOpen, onDelete }: BookCardProps) => {
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(book);
  };

  return (
    <div
      onClick={() => onOpen(book)}
      className="group relative bg-theme-surface rounded-xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-700/20 border border-theme hover:border-primary-700"
    >
      {/* Cover Image */}
      <div className="aspect-[2/3] bg-theme-accent flex items-center justify-center overflow-hidden">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={`Cover of ${book.title}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-theme-muted p-4">
            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="text-sm text-center">{book.title}</span>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-semibold text-theme truncate text-sm">{book.title}</h3>
        <p className="text-theme-muted text-xs truncate mt-1">{book.author}</p>
      </div>

      {/* Delete Button (appears on hover) */}
      <button
        onClick={handleDelete}
        className="absolute top-2 right-2 p-2 bg-red-600/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
        aria-label="Delete book"
      >
        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {/* Read indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-theme-accent">
        {/* Progress bar placeholder */}
      </div>
    </div>
  );
}

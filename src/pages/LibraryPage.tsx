import { useState, useCallback } from 'react';
import { DropZone, Shelf } from '@/components/library';
import { Modal, Button } from '@/components/ui';
import { usePersistedBook } from '@/hooks/usePersistedBook';
import { useEpubParser } from '@/hooks/useEpubParser';
import { useReaderStore } from '@/store/useReaderStore';
import type { Book } from '@/types';

interface LibraryPageProps {
  onOpenBook: (book: Book) => void;
}

export const LibraryPage = ({ onOpenBook }: LibraryPageProps) => {
  const { books, isLoading, addBook, deleteBook, refreshBooks } = usePersistedBook();
  const { parseEpub, metadata, isLoading: isParsing } = useEpubParser();
  const { settings, toggleTheme } = useReaderStore();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Parse EPUB to get metadata
      const arrayBuffer = await file.arrayBuffer();
      await parseEpub(arrayBuffer);
      
      // Wait a bit for metadata to be extracted
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get cover as blob if available
      let coverBlob: Blob | null = null;
      
      // Add book to database
      await addBook(file, {
        title: metadata?.title || file.name.replace('.epub', ''),
        author: metadata?.author || 'Unknown Author',
        cover: coverBlob
      });
      
      await refreshBooks();
    } catch (error) {
      console.error('Error adding book:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [parseEpub, metadata, addBook, refreshBooks]);

  const handleDeleteBook = useCallback((book: Book) => {
    setBookToDelete(book);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (bookToDelete) {
      await deleteBook(bookToDelete.id);
      setBookToDelete(null);
    }
  }, [bookToDelete, deleteBook]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b border-theme bg-theme-surface">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 shadow-sm">
              {/* Mini RSVP logo */}
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <rect x="4" y="6" width="10" height="4" rx="2" fill="black"/>
                <circle cx="18" cy="8" r="2.5" fill="#b91c1c"/>
                <rect x="22" y="6" width="14" height="4" rx="2" fill="black"/>
                
                <rect x="6" y="13" width="8" height="4" rx="2" fill="black"/>
                <circle cx="18" cy="15" r="2.5" fill="#b91c1c"/>
                <rect x="22" y="13" width="14" height="4" rx="2" fill="black"/>
                
                <rect x="4" y="20" width="12" height="4" rx="2" fill="black"/>
                <circle cx="18" cy="22" r="2.5" fill="#b91c1c"/>
                <rect x="22" y="20" width="14" height="4" rx="2" fill="black"/>
                
                <rect x="4" y="27" width="32" height="4" rx="2" fill="black"/>
                <circle cx="18" cy="29" r="2.5" fill="#b91c1c"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-theme">Fast Ebook Reader</h1>
              <p className="text-xs text-theme-muted">Speed Reader</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-theme-muted">
              {books.length} {books.length === 1 ? 'book' : 'books'}
            </span>
            
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

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6 bg-theme">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Drop Zone */}
          <section>
            <DropZone 
              onFileSelect={handleFileSelect} 
              isLoading={isProcessing || isParsing} 
            />
          </section>

          {/* Library */}
          <section>
            <h2 className="text-lg font-semibold text-theme mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-theme-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Your Library
            </h2>
            
            <Shelf 
              books={books}
              onOpenBook={onOpenBook}
              onDeleteBook={handleDeleteBook}
              isLoading={isLoading}
            />
          </section>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        title="Delete Book?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setBookToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmDelete}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-theme-secondary">
          Are you sure you want to delete <strong className="text-theme">"{bookToDelete?.title}"</strong>? 
          This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}

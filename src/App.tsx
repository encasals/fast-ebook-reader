import { useState, useCallback, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { LibraryPage } from './pages/LibraryPage';
import { ReaderPage } from './pages/ReaderPage';
import { useReaderStore } from './store/useReaderStore';
import type { Book } from './types';

const App = () => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const navigate = useNavigate();
  const { settings } = useReaderStore();

  // Apply theme class to document
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  const handleOpenBook = useCallback((book: Book) => {
    setSelectedBook(book);
    navigate('/read');
  }, [navigate]);

  const handleBackToLibrary = useCallback(() => {
    setSelectedBook(null);
    navigate('/');
  }, [navigate]);

  return (
    <div className="h-full w-full bg-theme">
      <Routes>
        <Route 
          path="/" 
          element={<LibraryPage onOpenBook={handleOpenBook} />} 
        />
        <Route 
          path="/read" 
          element={
            <ReaderPage 
              book={selectedBook} 
              onBack={handleBackToLibrary} 
            />
          } 
        />
      </Routes>
    </div>
  );
}

export default App;

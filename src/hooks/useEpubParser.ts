import { useState, useCallback, useRef } from 'react';
import ePub, { Book as EpubBook } from 'epubjs';
import type { Chapter } from '@/types';
import { tokenizeText } from '@/services/epubUtils';

interface BookMetadata {
  title: string;
  author: string;
  cover: string | null;
}

interface UseEpubParserResult {
  parseEpub: (data: ArrayBuffer) => Promise<{ chapters: Chapter[]; metadata: BookMetadata }>;
  getChapterContent: (chapterIndex: number) => Promise<string[]>;
  findFirstChapterWithContent: () => Promise<{ index: number; words: string[] }>;
  chapters: Chapter[];
  metadata: BookMetadata | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for parsing EPUB files and extracting content.
 */
export const useEpubParser = (): UseEpubParserResult => {
  const bookRef = useRef<EpubBook | null>(null);
  const chaptersRef = useRef<Chapter[]>([]);
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [metadata, setMetadata] = useState<BookMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseEpub = useCallback(async (data: ArrayBuffer): Promise<{ chapters: Chapter[]; metadata: BookMetadata }> => {
    setIsLoading(true);
    setError(null);

    try {
      const epub = ePub(data);
      await epub.ready;
      bookRef.current = epub;

      // Extract metadata
      const meta = await epub.loaded.metadata;
      let coverUrl: string | null = null;
      try {
        coverUrl = await epub.coverUrl();
      } catch {
        // Cover might not exist
      }
      
      const bookMetadata: BookMetadata = {
        title: meta.title || 'Untitled',
        author: meta.creator || 'Unknown Author',
        cover: coverUrl
      };
      setMetadata(bookMetadata);

      // Extract spine/chapters
      const spine = epub.spine as any;
      const chapterList: Chapter[] = [];

      if (spine && spine.items) {
        for (let i = 0; i < spine.items.length; i++) {
          const item = spine.items[i];
          
          // Find matching TOC entry
          let title = `Chapter ${i + 1}`;
          if (epub.navigation && epub.navigation.toc) {
            const nav = epub.navigation.toc.find(
              (toc: any) => toc.href && item.href && 
                (toc.href.includes(item.href) || item.href.includes(toc.href.split('#')[0]))
            );
            if (nav?.label) {
              title = nav.label;
            }
          }
          
          chapterList.push({
            id: item.idref || `chapter-${i}`,
            title,
            href: item.href,
            content: '',
            words: []
          });
        }
      }

      chaptersRef.current = chapterList;
      setChapters(chapterList);
      
      return { chapters: chapterList, metadata: bookMetadata };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to parse EPUB';
      setError(message);
      console.error('EPUB parsing error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getChapterContent = useCallback(async (chapterIndex: number): Promise<string[]> => {
    const book = bookRef.current;
    const chaptersList = chaptersRef.current;
    
    if (!book) {
      console.error('Book not loaded');
      return [];
    }
    
    if (chapterIndex < 0 || chapterIndex >= chaptersList.length) {
      console.error('Invalid chapter index:', chapterIndex, 'of', chaptersList.length);
      return [];
    }

    try {
      const chapter = chaptersList[chapterIndex];
      
      // Try to get section by href first
      let section = book.section(chapter.href);
      
      if (!section) {
        // Try by index as fallback
        section = book.section(chapterIndex);
      }
      
      if (!section) {
        console.error('Section not found for:', chapter.href);
        return [];
      }

      const contents = await section.load(book.load.bind(book));
      
      // Extract text from the section
      let textContent = '';
      
      if (contents instanceof Document) {
        const body = contents.body;
        if (body) {
          // Remove script and style elements
          const scripts = body.querySelectorAll('script, style, noscript');
          scripts.forEach(el => el.remove());
          textContent = body.textContent || '';
        }
      } else if (typeof contents === 'string') {
        // Parse HTML string
        const parser = new DOMParser();
        const doc = parser.parseFromString(contents, 'text/html');
        const scripts = doc.querySelectorAll('script, style, noscript');
        scripts.forEach(el => el.remove());
        textContent = doc.body?.textContent || '';
      } else if (contents && typeof contents === 'object') {
        // Handle Element or other DOM node types
        const el = contents as Element;
        if (el.textContent) {
          textContent = el.textContent;
        }
      }

      const words = tokenizeText(textContent);
      console.log('Extracted', words.length, 'words from chapter', chapterIndex, '- preview:', words.slice(0, 5).join(' '));
      
      return words;
    } catch (err) {
      console.error('Error loading chapter:', err);
      return [];
    }
  }, []);

  // Find first chapter with content
  const findFirstChapterWithContent = useCallback(async (): Promise<{ index: number; words: string[] }> => {
    const chaptersList = chaptersRef.current;
    
    for (let i = 0; i < chaptersList.length; i++) {
      const words = await getChapterContent(i);
      if (words.length > 0) {
        return { index: i, words };
      }
    }
    
    return { index: 0, words: [] };
  }, [getChapterContent]);

  return {
    parseEpub,
    getChapterContent,
    findFirstChapterWithContent,
    chapters,
    metadata,
    isLoading,
    error
  };
}

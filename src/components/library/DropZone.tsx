import React, { useState, useCallback } from 'react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export const DropZone = ({ onFileSelect, isLoading }: DropZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const epubFile = files.find(file => 
      file.name.toLowerCase().endsWith('.epub') || 
      file.type === 'application/epub+zip'
    );

    if (epubFile) {
      onFileSelect(epubFile);
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  }, [onFileSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative flex flex-col items-center justify-center
        min-h-[200px] p-8
        border-2 border-dashed rounded-xl
        transition-all duration-300 cursor-pointer
        ${isDragOver 
          ? 'border-primary-700 bg-primary-700/10 scale-102' 
          : 'border-theme hover:border-primary-700 bg-theme-surface/50 hover:bg-theme-surface'
        }
        ${isLoading ? 'pointer-events-none opacity-50' : ''}
      `}
    >
      <input
        type="file"
        accept=".epub,application/epub+zip"
        onChange={handleFileInput}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />

      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-700 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-theme-secondary">Processing EPUB...</p>
        </div>
      ) : (
        <>
          <div className={`mb-4 p-4 rounded-full ${isDragOver ? 'bg-primary-700/20' : 'bg-theme-accent'}`}>
            <svg 
              className={`w-10 h-10 ${isDragOver ? 'text-primary-700' : 'text-theme-muted'}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
              />
            </svg>
          </div>
          
          <p className="text-lg font-medium text-theme mb-1">
            {isDragOver ? 'Drop your EPUB here' : 'Drag & Drop EPUB'}
          </p>
          <p className="text-sm text-theme-muted">
            or click to browse
          </p>
        </>
      )}
    </div>
  );
}

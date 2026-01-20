import { useMemo } from 'react';
import { splitWordAtPivot } from '@/services/epubUtils';
import { useReaderStore } from '@/store/useReaderStore';

interface RSVPDisplayProps {
  word: string;
}

/**
 * The CORE component: Displays a single word with the pivot letter
 * aligned to the center of the screen.
 * 
 * Uses Flexbox layout:
 * - Left: Text before pivot (right-aligned)
 * - Center: Pivot letter (fixed width, colored)
 * - Right: Text after pivot (left-aligned)
 */
export const RSVPDisplay = ({ word }: RSVPDisplayProps) => {
  const { settings } = useReaderStore();
  
  const { beforePivot, pivot, afterPivot } = useMemo(() => {
    return splitWordAtPivot(word);
  }, [word]);

  if (!word) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-theme-muted text-lg">Press Play to start reading</p>
      </div>
    );
  }

  return (
    <div 
      className="relative flex items-center justify-center h-full select-none overflow-hidden"
      style={{ fontFamily: settings.fontFamily }}
    >
      {/* Container using absolute positioning to keep pivot centered */}
      <div className="relative flex items-baseline">
        {/* Left part - before pivot (positioned to end at center) */}
        <div 
          className="absolute right-1/2 text-right text-theme whitespace-pre"
          style={{ 
            fontSize: `${settings.fontSize}px`,
            marginRight: `${settings.fontSize * 0.35}px`
          }}
        >
          {beforePivot}
        </div>
        
        {/* Pivot letter - always at absolute center, highlighted */}
        <div 
          className="text-pivot font-bold"
          style={{ 
            fontSize: `${settings.fontSize}px`,
            textAlign: 'center'
          }}
        >
          {pivot}
        </div>
        
        {/* Right part - after pivot (positioned to start at center) */}
        <div 
          className="absolute left-1/2 text-left text-theme whitespace-pre"
          style={{ 
            fontSize: `${settings.fontSize}px`,
            marginLeft: `${settings.fontSize * 0.35}px`
          }}
        >
          {afterPivot}
        </div>
      </div>
      
      {/* Center guide line */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 pointer-events-none">
        <div className="w-0.5 h-4 bg-pivot/30 -mt-10" />
        <div className="w-0.5 h-4 bg-pivot/30 mt-14" />
      </div>
    </div>
  );
}

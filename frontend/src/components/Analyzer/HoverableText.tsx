import { useState } from 'react';
import WordAnalyzer from './WordAnalyzer';

interface HoverableTextProps {
  text: string;
  language: string;
  userId: number;
  className?: string;
}

/**
 * HoverableText - Makes every word in text clickable and analyzable
 * This is the core of the "Universal Analyzer" feature
 */
const HoverableText = ({ text, language, userId, className = '' }: HoverableTextProps) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const handleWordClick = (word: string, event: React.MouseEvent) => {
    // Clean the word (remove punctuation)
    const cleanWord = word.replace(/[.,!?;:()'"]/g, '');

    if (cleanWord.length > 0) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setPopupPosition({
        x: rect.left,
        y: rect.bottom + 10,
      });
      setSelectedWord(cleanWord);
    }
  };

  // Split text into words
  const words = text.split(/(\s+)/);

  return (
    <>
      <div className={className}>
        {words.map((word, idx) => {
          // Keep whitespace as-is
          if (/^\s+$/.test(word)) {
            return <span key={idx}>{word}</span>;
          }

          return (
            <span
              key={idx}
              onClick={(e) => handleWordClick(word, e)}
              className="hoverable-word"
            >
              {word}
            </span>
          );
        })}
      </div>

      {/* Word Analyzer Popup */}
      {selectedWord && (
        <WordAnalyzer
          word={selectedWord}
          language={language}
          position={popupPosition}
          onClose={() => setSelectedWord(null)}
          userId={userId}
        />
      )}
    </>
  );
};

export default HoverableText;

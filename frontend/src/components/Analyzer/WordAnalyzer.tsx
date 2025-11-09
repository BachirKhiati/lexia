import { useState, useEffect } from 'react';
import { analyzeWord, addWordToSynapse } from '../../services/api';
import type { AnalyzerResponse } from '../../types';

interface WordAnalyzerProps {
  word: string;
  language: string;
  position: { x: number; y: number };
  onClose: () => void;
  userId: number;
}

const WordAnalyzer = ({ word, language, position, onClose, userId }: WordAnalyzerProps) => {
  const [analysis, setAnalysis] = useState<AnalyzerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToSynapse, setAddingToSynapse] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const data = await analyzeWord(word, language);
        setAnalysis(data);
        setError(null);
      } catch (error) {
        console.error('Failed to analyze word:', error);
        setError('Unable to find definition for this word. Please try another word or check back later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [word, language]);

  const handleAddToSynapse = async () => {
    if (!analysis) return;

    setAddingToSynapse(true);
    try {
      await addWordToSynapse(
        userId,
        analysis.word,
        analysis.lemma,
        analysis.definition,
        analysis.part_of_speech,
        analysis.examples,
        language
      );
      // Update local state to show it's in synapse
      setAnalysis({ ...analysis, in_synapse: true });
    } catch (error) {
      console.error('Failed to add to Synapse:', error);
    } finally {
      setAddingToSynapse(false);
    }
  };

  const handlePlayAudio = () => {
    if (analysis?.audio_url) {
      const audio = new Audio(analysis.audio_url);
      audio.play();
    } else {
      // Use Web Speech API as fallback
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = language === 'finnish' ? 'fi-FI' : 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className="fixed z-50 bg-synapse-surface rounded-xl shadow-2xl border-2 border-synapse-primary w-96 max-h-[600px] overflow-y-auto"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        maxWidth: 'calc(100vw - 40px)',
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
      >
        ✕
      </button>

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-400 mb-2">{error}</p>
            <p className="text-sm text-gray-500">
              Word: <span className="font-mono text-white">{word}</span>
            </p>
          </div>
        ) : analysis ? (
          <>
            {/* Word header */}
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-white">{analysis.word}</h3>
                <button
                  onClick={handlePlayAudio}
                  className="text-synapse-primary hover:text-synapse-primary/80 text-xl"
                  title="Listen"
                >
                  🔊
                </button>
              </div>
              <p className="text-sm text-gray-400">
                <span className="font-semibold">Root:</span> {analysis.lemma}
                {analysis.part_of_speech && (
                  <>
                    {' • '}
                    <span className="italic">{analysis.part_of_speech}</span>
                  </>
                )}
              </p>
            </div>

            {/* Definition */}
            {analysis.definition && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-1">Definition</h4>
                <p className="text-white">{analysis.definition}</p>
              </div>
            )}

            {/* Examples */}
            {analysis.examples && analysis.examples.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">How to Use</h4>
                <ul className="space-y-2">
                  {analysis.examples.map((example, idx) => (
                    <li key={idx} className="text-sm text-gray-300 pl-4 border-l-2 border-synapse-primary">
                      "{example}"
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Conjugations */}
            {analysis.conjugations && analysis.conjugations.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-400 mb-2">Conjugation Map</h4>
                <div className="bg-synapse-background rounded-lg p-3 space-y-1">
                  {analysis.conjugations.slice(0, 6).map((conj, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-400">{conj.tense} ({conj.person})</span>
                      <span className="text-white font-mono">{conj.form}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Synapse button */}
            <button
              onClick={handleAddToSynapse}
              disabled={analysis.in_synapse || addingToSynapse}
              className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 ${
                analysis.in_synapse
                  ? 'bg-synapse-solid text-white cursor-not-allowed'
                  : 'bg-synapse-primary hover:bg-synapse-primary/90 text-white'
              }`}
            >
              {analysis.in_synapse ? '✓ In Your Synapse' : addingToSynapse ? 'Adding...' : '+ Add to Synapse'}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default WordAnalyzer;

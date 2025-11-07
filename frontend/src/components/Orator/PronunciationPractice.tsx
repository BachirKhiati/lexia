import { useState } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

interface PronunciationPracticeProps {
  targetWord: string;
  language: string;
}

const PronunciationPractice = ({ targetWord, language }: PronunciationPracticeProps) => {
  const languageCode = language === 'finnish' ? 'fi-FI' : 'en-US';

  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported, error } = useSpeechRecognition(languageCode);
  const { speak, speaking } = useSpeechSynthesis(languageCode);

  const [score, setScore] = useState<number | null>(null);

  const handleListen = () => {
    speak(targetWord);
  };

  const handleRecord = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setScore(null);
      startListening();
    }
  };

  const checkPronunciation = () => {
    if (!transcript) return;

    // Simple similarity check (in production, use more sophisticated comparison)
    const normalizedTarget = targetWord.toLowerCase().trim();
    const normalizedTranscript = transcript.toLowerCase().trim();

    if (normalizedTranscript === normalizedTarget) {
      setScore(100);
    } else if (normalizedTranscript.includes(normalizedTarget) || normalizedTarget.includes(normalizedTranscript)) {
      setScore(70);
    } else {
      // Levenshtein distance would be better here
      const similarity = calculateSimilarity(normalizedTarget, normalizedTranscript);
      setScore(Math.round(similarity * 100));
    }
  };

  // Simple similarity calculation
  const calculateSimilarity = (str1: string, str2: string): number => {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  };

  const levenshteinDistance = (str1: string, str2: string): number => {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  };

  if (!isSupported) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold mb-2">Speech Recognition Not Supported</h3>
        <p className="text-gray-400">
          Your browser doesn't support speech recognition. Try Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6 text-center">Pronunciation Practice</h2>

      {/* Target Word */}
      <div className="mb-6 text-center">
        <p className="text-sm text-gray-400 mb-2">Practice saying:</p>
        <h3 className="text-4xl font-bold text-synapse-primary mb-3">{targetWord}</h3>
        <button
          onClick={handleListen}
          disabled={speaking}
          className="btn-secondary"
        >
          {speaking ? '🔊 Playing...' : '🔊 Listen'}
        </button>
      </div>

      {/* Recording Controls */}
      <div className="mb-6">
        <button
          onClick={handleRecord}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all duration-200 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-synapse-primary hover:bg-synapse-primary/90'
          }`}
        >
          {isListening ? '🔴 Stop Recording' : '🎤 Start Recording'}
        </button>
      </div>

      {/* Transcript */}
      {transcript && (
        <div className="mb-6">
          <div className="bg-synapse-background rounded-lg p-4">
            <p className="text-sm text-gray-400 mb-2">You said:</p>
            <p className="text-xl font-semibold text-white">{transcript}</p>
          </div>

          <button
            onClick={checkPronunciation}
            className="btn-primary w-full mt-3"
          >
            Check My Pronunciation
          </button>
        </div>
      )}

      {/* Score */}
      {score !== null && (
        <div
          className={`p-4 rounded-lg text-center ${
            score >= 80
              ? 'bg-synapse-solid/20 border border-synapse-solid'
              : score >= 60
              ? 'bg-yellow-500/20 border border-yellow-500'
              : 'bg-red-500/20 border border-red-500'
          }`}
        >
          <p className="text-3xl font-bold mb-2">{score}%</p>
          <p className="text-sm">
            {score >= 80 ? '🎉 Excellent!' : score >= 60 ? '👍 Good try!' : '💪 Keep practicing!'}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-sm text-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

export default PronunciationPractice;

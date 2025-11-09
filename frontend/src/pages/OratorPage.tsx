import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import PronunciationPractice from '../components/Orator/PronunciationPractice';
import ConversationMode from '../components/Orator/ConversationMode';

const OratorPage = () => {
  const { user } = useAuth();
  const language = user?.language || 'finnish';
  const [mode, setMode] = useState<'pronunciation' | 'conversation'>('pronunciation');
  const [practiceWord, setPracticeWord] = useState('kirjoittaa');

  // Common Finnish words for practice
  const finnishWords = [
    'kirjoittaa', // to write
    'puhua',      // to speak
    'oppia',      // to learn
    'ymmärtää',   // to understand
    'harjoitella', // to practice
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            🗣️ <span className="text-lexia-accent">The Orator</span>
          </h1>
          <p className="text-lg sm:text-xl text-lexia-text-secondary">
            Your speaking coach. Practice pronunciation and have real conversations!
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => setMode('pronunciation')}
            className={`flex-1 py-4 rounded-lg font-semibold transition-all duration-200 ${
              mode === 'pronunciation'
                ? 'bg-lexia-primary text-lexia-text shadow-lg'
                : 'bg-lexia-surface text-lexia-text-secondary hover:bg-lexia-background'
            }`}
          >
            🎤 Pronunciation Practice
          </button>
          <button
            onClick={() => setMode('conversation')}
            className={`flex-1 py-4 rounded-lg font-semibold transition-all duration-200 ${
              mode === 'conversation'
                ? 'bg-lexia-primary text-lexia-text shadow-lg'
                : 'bg-lexia-surface text-lexia-text-secondary hover:bg-lexia-background'
            }`}
          >
            💬 Conversation Mode
          </button>
        </div>

        {/* Content */}
        {mode === 'pronunciation' ? (
          <div>
            {/* Word Selector */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold mb-3">Choose a word to practice:</h3>
              <div className="flex flex-wrap gap-2">
                {finnishWords.map((word) => (
                  <button
                    key={word}
                    onClick={() => setPracticeWord(word)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      practiceWord === word
                        ? 'bg-lexia-primary text-lexia-text'
                        : 'bg-lexia-background text-lexia-text hover:bg-lexia-surface'
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {/* Pronunciation Practice Component */}
            <PronunciationPractice targetWord={practiceWord} language={language} />
          </div>
        ) : (
          <ConversationMode language={language} topic="daily conversation" />
        )}

        {/* Info Card */}
        <div className="mt-6 p-4 bg-lexia-primary/10 rounded-lg border border-lexia-primary">
          <h4 className="font-semibold mb-2">💡 Tips for Better Results:</h4>
          <ul className="text-sm text-lexia-text space-y-1">
            <li>• Speak clearly and at a natural pace</li>
            <li>• Use a good microphone in a quiet environment</li>
            <li>• Allow microphone access when prompted</li>
            <li>• Works best in Chrome, Edge, or Safari</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default OratorPage;

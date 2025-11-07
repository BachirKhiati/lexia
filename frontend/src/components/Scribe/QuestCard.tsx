import { useState } from 'react';
import { Quest, QuestValidationResponse } from '../../types';
import { validateQuest } from '../../services/api';
import HoverableText from '../Analyzer/HoverableText';

interface QuestCardProps {
  quest: Quest;
  userId: number;
  onComplete: () => void;
}

const QuestCard = ({ quest, userId, onComplete }: QuestCardProps) => {
  const [userText, setUserText] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<QuestValidationResponse | null>(null);

  const handleSubmit = async () => {
    if (!userText.trim()) return;

    setValidating(true);
    try {
      const result = await validateQuest({
        quest_id: quest.id,
        user_text: userText,
      });
      setValidation(result);

      if (result.is_valid) {
        // Trigger success animation
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setValidating(false);
    }
  };

  return (
    <div
      className={`card ${
        validation?.is_valid ? 'quest-success' : ''
      }`}
    >
      {/* Quest Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-white">{quest.title}</h2>
          <span className="px-3 py-1 bg-synapse-primary/20 text-synapse-primary rounded-full text-sm font-semibold">
            {quest.difficulty}
          </span>
        </div>

        {/* Quest description - hoverable! */}
        <HoverableText
          text={quest.description}
          language="finnish"
          userId={userId}
          className="text-gray-300 mb-4"
        />
      </div>

      {/* User's answer area */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-gray-400 mb-2">
          Your Answer
        </label>
        <textarea
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Start writing..."
          className="textarea min-h-[150px]"
          disabled={validation?.is_valid}
        />
      </div>

      {/* AI Feedback */}
      {validation && (
        <div
          className={`p-4 rounded-lg mb-4 ${
            validation.is_valid
              ? 'bg-synapse-solid/20 border border-synapse-solid'
              : 'bg-orange-500/20 border border-orange-500'
          }`}
        >
          <p className="text-sm text-white">{validation.feedback}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!userText.trim() || validating || validation?.is_valid}
          className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validating ? 'Validating...' : validation?.is_valid ? '✓ Completed!' : 'Submit'}
        </button>

        <button
          onClick={() => setShowSolution(!showSolution)}
          className="btn-ghost"
        >
          {showSolution ? 'Hide' : '👁️ Glimpse'} Solution
        </button>
      </div>

      {/* Solution preview - also hoverable! */}
      {showSolution && (
        <div className="mt-4 p-4 bg-synapse-background rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 mb-2 font-semibold">EXAMPLE SOLUTION</p>
          <HoverableText
            text={quest.solution}
            language="finnish"
            userId={userId}
            className="text-gray-300 italic"
          />
        </div>
      )}
    </div>
  );
};

export default QuestCard;

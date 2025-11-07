import { useState } from 'react';

const OratorPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleStartRecording = () => {
    // TODO: Implement Web Speech API for recording
    setIsRecording(true);

    // Placeholder
    setTimeout(() => {
      setTranscript('This is a placeholder transcript. In production, this would use the Web Speech API.');
      setIsRecording(false);
    }, 2000);
  };

  const handleStopRecording = () => {
    setIsRecording(false);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🗣️ <span className="text-synapse-primary">The Orator</span>
          </h1>
          <p className="text-xl text-gray-400">
            Your speaking coach. Practice pronunciation and have real conversations.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="card mb-8 text-center bg-gradient-to-br from-synapse-secondary/20 to-synapse-primary/20 border-2 border-synapse-secondary">
          <div className="text-6xl mb-4">🚧</div>
          <h2 className="text-2xl font-bold mb-2">Coming Soon!</h2>
          <p className="text-gray-300 mb-6">
            The Orator module is under development. It will include:
          </p>

          <div className="text-left max-w-md mx-auto space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎤</span>
              <div>
                <strong className="text-white">Pronunciation Practice</strong>
                <p className="text-sm text-gray-400">Record yourself and get AI feedback on your pronunciation</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <strong className="text-white">AI Conversations</strong>
                <p className="text-sm text-gray-400">Have real-time conversations with AI in Finnish</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <strong className="text-white">Progress Tracking</strong>
                <p className="text-sm text-gray-400">Track your speaking progress over time</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <strong className="text-white">Speaking Quests</strong>
                <p className="text-sm text-gray-400">Complete speaking challenges based on your written quests</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pronunciation Demo */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Pronunciation Demo (Preview)</h2>

          <div className="bg-synapse-background rounded-lg p-6 mb-4">
            <p className="text-gray-400 mb-4">Try pronouncing this Finnish word:</p>
            <h3 className="text-3xl font-bold text-white mb-2">Hyvää päivää</h3>
            <p className="text-sm text-gray-400 mb-4">(Good day / Hello)</p>

            <button
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              className={`btn-primary ${isRecording ? 'animate-pulse' : ''}`}
            >
              {isRecording ? '🔴 Stop Recording' : '🎤 Start Recording'}
            </button>
          </div>

          {transcript && (
            <div className="bg-synapse-primary/20 rounded-lg p-4 border border-synapse-primary">
              <p className="text-sm text-gray-300">{transcript}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OratorPage;

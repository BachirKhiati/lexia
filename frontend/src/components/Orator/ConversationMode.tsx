import { useState } from 'react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '../../hooks/useSpeechSynthesis';

interface Message {
  role: 'ai' | 'user';
  text: string;
  timestamp: Date;
}

interface ConversationModeProps {
  language: string;
  topic?: string;
}

const ConversationMode = ({ language, topic = 'daily life' }: ConversationModeProps) => {
  const languageCode = language === 'finnish' ? 'fi-FI' : 'en-US';

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'ai',
      text: language === 'finnish' ? 'Hei! Miten voin auttaa sinua tänään?' : 'Hello! How can I help you today?',
      timestamp: new Date(),
    },
  ]);

  const { isListening, transcript, startListening, stopListening, resetTranscript, isSupported } = useSpeechRecognition(languageCode);
  const { speak } = useSpeechSynthesis(languageCode);

  const handleStartTalking = () => {
    resetTranscript();
    startListening();
  };

  const handleStopTalking = () => {
    stopListening();

    if (transcript) {
      // Add user message
      const userMessage: Message = {
        role: 'user',
        text: transcript,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage]);

      // Simulate AI response (in production, call your AI API)
      setTimeout(() => {
        const aiResponse = generateAIResponse(transcript, language);
        const aiMessage: Message = {
          role: 'ai',
          text: aiResponse,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        speak(aiResponse);
      }, 1000);
    }
  };

  const generateAIResponse = (_userInput: string, lang: string): string => {
    // Simplified AI response (in production, use your AI service)
    if (lang === 'finnish') {
      const responses = [
        'Se on mielenkiintoista! Kerro lisää.',
        'Ymmärrän. Mitä muuta?',
        'Hienoa! Jatka vain.',
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    } else {
      const responses = [
        'That\'s interesting! Tell me more.',
        'I understand. What else?',
        'Great! Please continue.',
      ];
      return responses[Math.floor(Math.random() * responses.length)];
    }
  };

  if (!isSupported) {
    return (
      <div className="card text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold mb-2">Speech Not Supported</h3>
        <p className="text-gray-400">
          Your browser doesn't support speech features. Try Chrome, Edge, or Safari.
        </p>
      </div>
    );
  }

  return (
    <div className="card h-[600px] flex flex-col">
      <h2 className="text-2xl font-bold mb-4">🗣️ Conversation Practice</h2>
      <p className="text-sm text-gray-400 mb-4">Topic: {topic}</p>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-3">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-synapse-primary text-white'
                  : 'bg-synapse-background text-gray-300'
              }`}
            >
              <p className="text-sm font-semibold mb-1">
                {msg.role === 'user' ? 'You' : 'AI Teacher'}
              </p>
              <p>{msg.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {msg.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Current transcript */}
      {isListening && transcript && (
        <div className="mb-3 p-3 bg-synapse-background rounded-lg">
          <p className="text-sm text-gray-400 mb-1">Listening...</p>
          <p className="text-white">{transcript}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={isListening ? handleStopTalking : handleStartTalking}
          className={`flex-1 py-3 rounded-lg font-bold transition-all duration-200 ${
            isListening
              ? 'bg-red-500 hover:bg-red-600 animate-pulse'
              : 'bg-synapse-primary hover:bg-synapse-primary/90'
          }`}
        >
          {isListening ? '🛑 Stop Talking' : '🎤 Start Talking'}
        </button>

        <button
          onClick={() => setMessages(messages.slice(0, 1))}
          className="px-6 py-3 bg-synapse-background hover:bg-synapse-surface rounded-lg font-semibold transition-all duration-200"
        >
          🔄 Reset
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        💡 Tip: Speak clearly and at a normal pace for best results
      </p>
    </div>
  );
};

export default ConversationMode;

import axios from 'axios';
import type {
  Quest,
  AnalyzerResponse,
  MindMapData,
  QuestValidationRequest,
  QuestValidationResponse
} from '../types';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Analyzer API
export const analyzeWord = async (word: string, language: string, context?: string): Promise<AnalyzerResponse> => {
  const { data } = await api.post('/analyze', { word, language, context });
  return data;
};

// Quest API
export const getUserQuests = async (userId: number): Promise<Quest[]> => {
  const { data } = await api.get(`/users/${userId}/quests`);
  return data;
};

export const generateQuest = async (userId: number): Promise<Quest> => {
  const { data } = await api.post(`/users/${userId}/quests/generate`);
  return data;
};

export const validateQuest = async (request: QuestValidationRequest): Promise<QuestValidationResponse> => {
  const { data } = await api.post(`/users/${request.quest_id}/quests/validate`, request);
  return data;
};

// Synapse API
export const getMindMap = async (userId: number): Promise<MindMapData> => {
  const { data } = await api.get(`/users/${userId}/synapse`);
  return data;
};

export const addWordToSynapse = async (
  userId: number,
  word: string,
  lemma: string,
  definition: string,
  partOfSpeech: string,
  examples: string[],
  language: string
): Promise<{ id: number; status: string }> => {
  const { data } = await api.post(`/users/${userId}/synapse/words`, {
    word,
    lemma,
    definition,
    part_of_speech: partOfSpeech,
    examples,
    language,
  });
  return data;
};

export default api;

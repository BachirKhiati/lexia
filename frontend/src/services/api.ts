import axios from 'axios';
import type {
  Quest,
  AnalyzerResponse,
  MindMapData,
  QuestValidationRequest,
  QuestValidationResponse
} from '../types';

export const API_BASE_URL = '/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('synapse_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('synapse_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

// Lens API - Article Import
export interface Article {
  id: number;
  title: string;
  content: string;
  url: string;
}

export const importArticle = async (url: string, language: string): Promise<Article> => {
  const { data } = await api.post('/lens/import', { url, language });
  return data;
};

export const getUserArticles = async (): Promise<Article[]> => {
  const { data } = await api.get('/lens/articles');
  return data;
};

// User Progress API
export interface UserProgress {
  words_mastered: number;
  quests_completed: number;
  streak_days: number;
  last_active_at: string;
}

export const getUserProgress = async (): Promise<UserProgress> => {
  const { data } = await api.get('/users/progress');
  return data;
};

export default api;

import { API_BASE_URL } from './api';

export interface LearningStats {
  total_words: number;
  words_mastered: number;
  ghost_words: number;
  solid_words: number;
  quests_completed: number;
  quests_pending: number;
  current_streak: number;
  longest_streak: number;
  words_due_today: number;
  average_ease_factor: number;
  total_reviews: number;
}

export interface WordsOverTime {
  date: string;
  count: number;
}

export interface QuestsOverTime {
  date: string;
  count: number;
}

export interface WordsByPartOfSpeech {
  part_of_speech: string;
  count: number;
}

export interface ChallengingWords {
  word: string;
  definition: string;
  ease_factor: number;
  reviews: number;
}

export const analyticsService = {
  async getLearningStats(): Promise<LearningStats> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/analytics/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch learning stats');
    }

    return response.json();
  },

  async getWordsOverTime(days: number = 30): Promise<WordsOverTime[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_BASE_URL}/analytics/words-over-time?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch words over time');
    }

    return response.json();
  },

  async getQuestsOverTime(days: number = 30): Promise<QuestsOverTime[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_BASE_URL}/analytics/quests-over-time?days=${days}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch quests over time');
    }

    return response.json();
  },

  async getWordsByPartOfSpeech(): Promise<WordsByPartOfSpeech[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/analytics/words-by-pos`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch words by part of speech');
    }

    return response.json();
  },

  async getChallengingWords(limit: number = 10): Promise<ChallengingWords[]> {
    const token = localStorage.getItem('token');
    const response = await fetch(
      `${API_BASE_URL}/analytics/challenging-words?limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch challenging words');
    }

    return response.json();
  },
};

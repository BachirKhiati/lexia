export interface User {
  id: number;
  email: string;
  username: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Quest {
  id: number;
  user_id: number;
  title: string;
  description: string;
  solution: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  completed_at?: string;
}

export interface Word {
  id: number;
  user_id: number;
  word: string;
  lemma: string;
  language: string;
  definition: string;
  part_of_speech: string;
  examples: string[];
  status: 'ghost' | 'solid';
  added_at: string;
  mastered_at?: string;
}

export interface WordConjugation {
  id: number;
  word_id: number;
  tense: string;
  person: string;
  form: string;
  language: string;
}

export interface AnalyzerResponse {
  word: string;
  lemma: string;
  definition: string;
  part_of_speech: string;
  examples: string[];
  conjugations?: WordConjugation[];
  audio_url?: string;
  in_synapse: boolean;
}

export interface MindMapNode {
  id: number;
  word: string;
  status: 'ghost' | 'solid';
  category: string;
  x?: number;
  y?: number;
}

export interface MindMapLink {
  source: number;
  target: number;
  relation_type: string;
}

export interface MindMapData {
  nodes: MindMapNode[];
  links: MindMapLink[];
}

export interface QuestValidationRequest {
  quest_id: number;
  user_text: string;
}

export interface QuestValidationResponse {
  is_valid: boolean;
  feedback: string;
  new_words?: string[];
}

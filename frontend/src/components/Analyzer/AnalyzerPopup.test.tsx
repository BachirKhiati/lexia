import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AnalyzerPopup from './AnalyzerPopup';

// Mock the API
jest.mock('../../services/api', () => ({
  analyzeWord: jest.fn(),
}));

import { analyzeWord } from '../../services/api';

const mockAnalyzeWord = analyzeWord as jest.MockedFunction<typeof analyzeWord>;

// Helper to wrap component with providers
const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('AnalyzerPopup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    mockAnalyzeWord.mockResolvedValue({
      word: 'kirja',
      lemma: 'kirja',
      definition: 'book',
      part_of_speech: 'noun',
      examples: ['Luen kirjaa', 'Minulla on kirja'],
      conjugations: [],
      audio_url: '',
      in_synapse: false,
    });

    renderWithProviders(
      <AnalyzerPopup word="kirja" language="finnish" onClose={() => {}} />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('displays word definition after loading', async () => {
    mockAnalyzeWord.mockResolvedValue({
      word: 'kirja',
      lemma: 'kirja',
      definition: 'book',
      part_of_speech: 'noun',
      examples: ['Luen kirjaa', 'Minulla on kirja'],
      conjugations: [],
      audio_url: '',
      in_synapse: false,
    });

    renderWithProviders(
      <AnalyzerPopup word="kirja" language="finnish" onClose={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('book')).toBeInTheDocument();
    });
  });

  it('displays error message on API failure', async () => {
    mockAnalyzeWord.mockRejectedValue(new Error('API Error'));

    renderWithProviders(
      <AnalyzerPopup word="invalid" language="finnish" onClose={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('calls API with correct parameters', () => {
    mockAnalyzeWord.mockResolvedValue({
      word: 'talo',
      lemma: 'talo',
      definition: 'house',
      part_of_speech: 'noun',
      examples: [],
      conjugations: [],
      audio_url: '',
      in_synapse: false,
    });

    renderWithProviders(
      <AnalyzerPopup word="talo" language="finnish" onClose={() => {}} />
    );

    expect(mockAnalyzeWord).toHaveBeenCalledWith('talo', 'finnish', undefined);
  });

  it('displays conjugations for verbs', async () => {
    mockAnalyzeWord.mockResolvedValue({
      word: 'puhua',
      lemma: 'puhua',
      definition: 'to speak',
      part_of_speech: 'verb',
      examples: [],
      conjugations: [
        { id: 1, word_id: 0, tense: 'present', person: '1sg', form: 'puhun', language: 'finnish' },
        { id: 2, word_id: 0, tense: 'present', person: '2sg', form: 'puhut', language: 'finnish' },
      ],
      audio_url: '',
      in_synapse: false,
    });

    renderWithProviders(
      <AnalyzerPopup word="puhua" language="finnish" onClose={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('puhun')).toBeInTheDocument();
      expect(screen.getByText('puhut')).toBeInTheDocument();
    });
  });

  it('shows examples when available', async () => {
    mockAnalyzeWord.mockResolvedValue({
      word: 'kissa',
      lemma: 'kissa',
      definition: 'cat',
      part_of_speech: 'noun',
      examples: ['Minulla on kissa', 'Kissa nukkuu'],
      conjugations: [],
      audio_url: '',
      in_synapse: false,
    });

    renderWithProviders(
      <AnalyzerPopup word="kissa" language="finnish" onClose={() => {}} />
    );

    await waitFor(() => {
      expect(screen.getByText('Minulla on kissa')).toBeInTheDocument();
      expect(screen.getByText('Kissa nukkuu')).toBeInTheDocument();
    });
  });
});

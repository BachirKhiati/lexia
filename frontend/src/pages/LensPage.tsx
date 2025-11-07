import { useState } from 'react';
import HoverableText from '../components/Analyzer/HoverableText';
import { useAuth } from '../contexts/AuthContext';
import { importArticle } from '../services/api';

const LensPage = () => {
  const { user } = useAuth();
  const userId = user?.id || 1;
  const language = user?.language || 'finnish';
  const [url, setUrl] = useState('');
  const [article, setArticle] = useState<{ title: string; content: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!url.trim()) return;

    setLoading(true);
    setError('');
    try {
      const importedArticle = await importArticle(url, language);
      setArticle({
        title: importedArticle.title,
        content: importedArticle.content,
      });
      setUrl(''); // Clear URL input after successful import
    } catch (err: any) {
      setError(err.response?.data || 'Failed to import article. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            🌍 <span className="text-synapse-primary">The Lens</span>
          </h1>
          <p className="text-xl text-gray-400">
            Import real-world content and turn it into an interactive learning experience.
          </p>
        </div>

        {/* Import form */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold mb-4">Import Content</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mb-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleImport()}
              placeholder="Paste URL (article, blog post, Wikipedia...)"
              className="input flex-1"
            />
            <button onClick={handleImport} disabled={loading || !url.trim()} className="btn-primary">
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>

          <p className="text-sm text-gray-400">
            ✨ Paste any article URL and we'll extract the main content for you!
          </p>
        </div>

        {/* Imported content */}
        {article && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold">{article.title}</h2>
                <p className="text-sm text-gray-400 mt-1">Click any word to analyze it!</p>
              </div>
              <button onClick={() => setArticle(null)} className="text-gray-400 hover:text-white">
                Clear
              </button>
            </div>

            <div className="bg-synapse-background rounded-lg p-6">
              <HoverableText text={article.content} language={language} userId={userId} className="text-gray-300 leading-relaxed" />
            </div>

            <div className="mt-4 p-3 bg-synapse-primary/20 rounded-lg border border-synapse-primary">
              <p className="text-sm text-gray-300">
                💡 <strong>Pro tip:</strong> Click on any word to analyze it. Add unknown words to your Synapse to
                create quests for them!
              </p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!article && !loading && (
          <div className="card text-center">
            <div className="text-6xl mb-4">🌍</div>
            <h2 className="text-2xl font-bold mb-2">No Content Imported Yet</h2>
            <p className="text-gray-400">
              Paste a URL above to import content and make it interactive!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LensPage;

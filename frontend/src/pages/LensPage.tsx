import { useState } from 'react';
import HoverableText from '../components/Analyzer/HoverableText';
import { useAuth } from '../contexts/AuthContext';

const LensPage = () => {
  const { user } = useAuth();
  const userId = user?.id || 1;
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      // TODO: Implement actual article import API
      // For now, using placeholder
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setContent(`
        This is placeholder content from the imported article.
        In a production version, this would:
        1. Fetch the actual URL content
        2. Extract the main text from HTML
        3. Clean and format it
        4. Make every word hoverable with the Analyzer

        For example, if you imported a Finnish news article about "teknologia" (technology),
        you could hover over any word to see its definition, examples, and conjugations.

        Try clicking on any word in this text to see the Analyzer in action!
      `);
    } catch (error) {
      console.error('Import failed:', error);
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

          <div className="flex gap-3 mb-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste URL (article, blog post, or YouTube video)"
              className="input flex-1"
            />
            <button onClick={handleImport} disabled={loading || !url.trim()} className="btn-primary">
              {loading ? 'Importing...' : 'Import'}
            </button>
          </div>

          <p className="text-sm text-gray-400">
            Supported: News articles, blog posts, Wikipedia, YouTube (with transcripts)
          </p>
        </div>

        {/* Imported content */}
        {content && (
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Imported Article</h2>
              <button onClick={() => setContent('')} className="text-gray-400 hover:text-white">
                Clear
              </button>
            </div>

            <div className="bg-synapse-background rounded-lg p-6">
              <HoverableText text={content} language="finnish" userId={userId} className="text-gray-300 leading-relaxed" />
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
        {!content && !loading && (
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

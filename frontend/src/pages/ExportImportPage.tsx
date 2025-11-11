import { useState } from 'react';
import { Download, Upload, FileJson, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

export default function ExportImportPage() {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleExportJSON = async () => {
    try {
      const token = localStorage.getItem('lexia_token');
      const response = await fetch('/api/v1/export/json', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lexia-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export data');
    }
  };

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('lexia_token');
      const response = await fetch('/api/v1/export/csv', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lexia-vocabulary-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to export vocabulary');
    }
  };

  const handleImportCSV = async (file: File) => {
    setImporting(true);
    setError('');
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('lexia_token');
      const response = await fetch('/api/v1/import/csv', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Import failed');

      const result = await response.json();
      setImportResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to import CSV');
    } finally {
      setImporting(false);
    }
  };

  const handleImportJSON = async (file: File) => {
    setImporting(true);
    setError('');
    setImportResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('lexia_token');
      const response = await fetch('/api/v1/import/json', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Import failed');

      const result = await response.json();
      setImportResult(result);
    } catch (err: any) {
      setError(err.message || 'Failed to import JSON');
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'csv' | 'json') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'csv') {
      handleImportCSV(file);
    } else {
      handleImportJSON(file);
    }

    // Reset input
    event.target.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-lexia-text flex items-center gap-2">
          💾 Export & Import Data
        </h1>
        <p className="text-sm sm:text-base text-lexia-text-secondary">
          Export your learning data or import vocabulary from external sources
        </p>
      </div>

      {/* Export Section */}
      <div className="bg-lexia-surface border border-lexia-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-lexia-text">
          <Download className="w-5 h-5" />
          Export Your Data
        </h2>
        <p className="text-lexia-text-secondary mb-6">
          Download all your vocabulary, quests, and progress data for backup or migration
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-3 p-4 bg-lexia-background hover:bg-lexia-border border border-lexia-border rounded-lg transition-colors group"
          >
            <FileJson className="w-8 h-8 text-lexia-accent flex-shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-lexia-text group-hover:text-lexia-accent transition-colors">
                Export as JSON
              </div>
              <div className="text-sm text-lexia-text-secondary">
                Complete backup with all data
              </div>
            </div>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-3 p-4 bg-lexia-background hover:bg-lexia-border border border-lexia-border rounded-lg transition-colors group"
          >
            <FileSpreadsheet className="w-8 h-8 text-lexia-accent flex-shrink-0" />
            <div className="text-left">
              <div className="font-semibold text-lexia-text group-hover:text-lexia-accent transition-colors">
                Export as CSV
              </div>
              <div className="text-sm text-lexia-text-secondary">
                Vocabulary only (Excel compatible)
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-lexia-surface border border-lexia-border rounded-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-lexia-text">
          <Upload className="w-5 h-5" />
          Import Data
        </h2>
        <p className="text-lexia-text-secondary mb-6">
          Import vocabulary from CSV files or restore your complete data from a JSON export
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Import CSV */}
          <label className="flex items-center gap-3 p-4 bg-lexia-background hover:bg-lexia-border border border-lexia-border rounded-lg transition-colors cursor-pointer group">
            <FileSpreadsheet className="w-8 h-8 text-lexia-accent flex-shrink-0" />
            <div className="text-left flex-1">
              <div className="font-semibold text-lexia-text group-hover:text-lexia-accent transition-colors">
                Import CSV
              </div>
              <div className="text-sm text-lexia-text-secondary">
                Add vocabulary from CSV file
              </div>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileSelect(e, 'csv')}
              className="hidden"
              disabled={importing}
            />
          </label>

          {/* Import JSON */}
          <label className="flex items-center gap-3 p-4 bg-lexia-background hover:bg-lexia-border border border-lexia-border rounded-lg transition-colors cursor-pointer group">
            <FileJson className="w-8 h-8 text-lexia-accent flex-shrink-0" />
            <div className="text-left flex-1">
              <div className="font-semibold text-lexia-text group-hover:text-lexia-accent transition-colors">
                Import JSON
              </div>
              <div className="text-sm text-lexia-text-secondary">
                Restore complete backup
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={(e) => handleFileSelect(e, 'json')}
              className="hidden"
              disabled={importing}
            />
          </label>
        </div>

        {/* CSV Format Guide */}
        <div className="mt-6 bg-lexia-background border border-lexia-border rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-lexia-text">CSV Format</h3>
          <p className="text-sm text-lexia-text-secondary mb-2">
            Your CSV file should have the following columns (header row required):
          </p>
          <code className="block bg-lexia-surface p-2 rounded text-sm text-lexia-accent">
            Word, Definition, Part of Speech
          </code>
          <p className="text-xs text-lexia-text-secondary mt-2">
            Additional columns (Status, Ease Factor, etc.) are optional
          </p>
        </div>
      </div>

      {/* Import Result */}
      {importResult && (
        <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-200 mb-2">Import Successful</h3>
              <div className="text-sm text-green-300 space-y-1">
                {importResult.imported !== undefined && (
                  <p>✓ Imported: {importResult.imported} items</p>
                )}
                {importResult.words_imported !== undefined && (
                  <p>✓ Words imported: {importResult.words_imported}</p>
                )}
                {importResult.quests_imported !== undefined && (
                  <p>✓ Quests imported: {importResult.quests_imported}</p>
                )}
                {importResult.skipped > 0 && (
                  <p className="text-yellow-300">⊘ Skipped: {importResult.skipped} (already exists)</p>
                )}
                {importResult.words_skipped > 0 && (
                  <p className="text-yellow-300">⊘ Words skipped: {importResult.words_skipped}</p>
                )}
                {importResult.quests_skipped > 0 && (
                  <p className="text-yellow-300">⊘ Quests skipped: {importResult.quests_skipped}</p>
                )}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-red-300">Errors:</p>
                    <ul className="list-disc list-inside text-xs">
                      {importResult.errors.slice(0, 5).map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                      {importResult.errors.length > 5 && (
                        <li>... and {importResult.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-200 mb-1">Error</h3>
              <p className="text-sm text-red-300">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {importing && (
        <div className="text-center py-8">
          <div className="loading-spinner mx-auto mb-4" />
          <p className="text-lexia-text-secondary">Importing data...</p>
        </div>
      )}

      {/* Info Section */}
      <div className="bg-lexia-background border border-lexia-border rounded-lg p-6">
        <h3 className="font-semibold mb-3 text-lexia-text">Data Privacy</h3>
        <ul className="space-y-2 text-sm text-lexia-text-secondary">
          <li className="flex items-start gap-2">
            <span className="text-lexia-accent">•</span>
            <span>Exports include all your vocabulary, quests, and progress data</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lexia-accent">•</span>
            <span>Imported words that already exist will be skipped</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lexia-accent">•</span>
            <span>JSON exports preserve all SRS data and progress</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lexia-accent">•</span>
            <span>CSV imports create new words with default SRS values</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

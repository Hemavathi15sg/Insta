import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Copy, Check, Loader2 } from 'lucide-react';

interface AICaptionSuggestionsProps {
  imageFile: File;
  onCaptionSelect: (caption: string) => void;
}

const AICaptionSuggestions: React.FC<AICaptionSuggestionsProps> = ({
  imageFile,
  onCaptionSelect,
}) => {
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateCaptions = async () => {
    setLoading(true);
    setError('');
    setCaptions([]);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/posts/generate-caption', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setCaptions(response.data.captions);
      } else {
        setError(response.data.error || 'Failed to generate captions');
      }
    } catch (err: any) {
      console.error('Error generating captions:', err);
      const errorMessage =
        err.response?.data?.error || 'Failed to generate captions. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCaption = (caption: string, index: number) => {
    navigator.clipboard.writeText(caption);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-600" size={20} />
          <h3 className="font-semibold text-gray-800">AI Caption Suggestions</h3>
        </div>
        {!captions.length && !loading && (
          <button
            onClick={generateCaptions}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Sparkles size={16} />
            Generate
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-purple-600" size={32} />
          <span className="ml-3 text-gray-600">Generating captions...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      {captions.length > 0 && (
        <div className="space-y-2">
          {captions.map((caption, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2">
                <p
                  className="text-gray-700 text-sm flex-1"
                  onClick={() => onCaptionSelect(caption)}
                >
                  {caption}
                </p>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleCopyCaption(caption, index)}
                    className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                    title="Copy caption"
                  >
                    {copiedIndex === index ? (
                      <Check className="text-green-600" size={16} />
                    ) : (
                      <Copy className="text-gray-600" size={16} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={generateCaptions}
            className="w-full py-2 text-purple-600 text-sm font-medium hover:bg-purple-50 rounded transition-colors"
          >
            Generate New Suggestions
          </button>
        </div>
      )}
    </div>
  );
};

export default AICaptionSuggestions;

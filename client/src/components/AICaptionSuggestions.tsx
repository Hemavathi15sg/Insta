import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';

interface AICaptionSuggestionsProps {
  imageFile: File;
  onCaptionSelect: (caption: string) => void;
}

const AICaptionSuggestions: React.FC<AICaptionSuggestionsProps> = ({ 
  imageFile, 
  onCaptionSelect 
}) => {
  const [captions, setCaptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    setCaptions([]);
    setError('');
    setSelectedIndex(null);
  }, [imageFile]);

  const generateCaptions = async () => {
    setLoading(true);
    setError('');
    setCaptions([]);
    setSelectedIndex(null);

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

      if (response.data.success && response.data.captions) {
        setCaptions(response.data.captions);
      } else {
        setError(response.data.error || 'Failed to generate captions');
      }
    } catch (err: any) {
      console.error('Error generating captions:', err);
      
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network.');
      } else {
        setError('Failed to generate captions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCaption = (caption: string, index: number) => {
    setSelectedIndex(index);
    onCaptionSelect(caption);
  };

  return (
    <div className="rounded-lg p-4 bg-white border-2 border-purple-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-2 rounded-full">
            <Sparkles className="text-white" size={18} />
          </div>
          <h3 className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Caption Magic
          </h3>
        </div>
        
        {!loading && captions.length === 0 && !error && (
          <button
            onClick={generateCaptions}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg flex items-center gap-2"
          >
            <Sparkles size={16} />
            Generate
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8 text-purple-600">
          <Loader2 className="animate-spin mr-3" size={24} />
          <span className="font-semibold">Creating perfect captions...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="text-sm text-red-700 font-semibold">{error}</p>
              <button
                onClick={generateCaptions}
                className="mt-2 text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {captions.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-gray-700 mb-3">
            💡 Choose a caption or customize it:
          </p>
          
          {captions.map((caption, index) => (
            <button
              key={index}
              onClick={() => handleSelectCaption(caption, index)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all transform hover:scale-105 ${
                selectedIndex === index
                  ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25'
              }`}
            >
              <p className="text-sm text-gray-800 whitespace-pre-wrap font-medium">{caption}</p>
              {selectedIndex === index && (
                <span className="inline-block mt-3 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full font-semibold">
                  ✓ Selected
                </span>
              )}
            </button>
          ))}

          <button
            onClick={generateCaptions}
            className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-indigo-100 to-purple-100 text-gray-700 text-sm rounded-lg hover:from-indigo-200 hover:to-purple-200 transition-all font-semibold flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            🔄 Generate Different Captions
          </button>
        </div>
      )}

      {!loading && captions.length === 0 && !error && (
        <p className="text-sm text-gray-600 text-center py-6 font-medium">
          ✨ Click Generate to get AI-powered caption suggestions for your image.
        </p>
      )}
    </div>
  );
};

export default AICaptionSuggestions;

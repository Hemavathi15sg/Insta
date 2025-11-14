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
    // Reset state when image changes
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
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="text-purple-500" size={20} />
          <h3 className="font-semibold text-gray-800">AI Caption Suggestions</h3>
        </div>
        
        {!loading && captions.length === 0 && !error && (
          <button
            onClick={generateCaptions}
            className="px-4 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
          >
            <Sparkles size={16} />
            Generate Captions
          </button>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-8 text-gray-600">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span>Generating captions...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="text-sm text-red-700">{error}</p>
              <button
                onClick={generateCaptions}
                className="mt-2 text-sm text-red-600 underline hover:text-red-800"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Caption suggestions */}
      {captions.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-2">
            Click on a caption to use it (you can edit it after):
          </p>
          
          {captions.map((caption, index) => (
            <button
              key={index}
              onClick={() => handleSelectCaption(caption, index)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedIndex === index
                  ? 'border-purple-500 bg-purple-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-25'
              }`}
            >
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{caption}</p>
              {selectedIndex === index && (
                <span className="inline-block mt-2 text-xs text-purple-600 font-medium">
                  ✓ Selected
                </span>
              )}
            </button>
          ))}

          <button
            onClick={generateCaptions}
            className="w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            Generate New Captions
          </button>
        </div>
      )}

      {!loading && captions.length === 0 && !error && (
        <p className="text-sm text-gray-500 text-center py-4">
          Click "Generate Captions" to get AI-powered caption suggestions for your image.
        </p>
      )}
    </div>
  );
};

export default AICaptionSuggestions;

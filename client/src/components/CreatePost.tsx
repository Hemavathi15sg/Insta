import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, Sparkles } from 'lucide-react';
import AICaptionSuggestions from './AICaptionSuggestions';

interface CreatePostProps {
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPostCreated }) => {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCaptionSelect = (selectedCaption: string) => {
    setCaption(selectedCaption);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!image) return;

    const formData = new FormData();
    formData.append('image', image);
    formData.append('caption', caption);

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/posts', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      onPostCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create post', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="card-gradient w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex justify-between items-center mb-6 p-6 border-b border-gray-200 bg-gradient-to-r from-pink-50 to-purple-50">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-2 rounded-full">
              <Sparkles size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Create Post</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Image Upload Section */}
          <div className="mb-6">
            <label className="block mb-3 text-sm font-bold text-gray-700">📸 Choose Image</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="image-input"
                required
              />
              <label 
                htmlFor="image-input"
                className="flex items-center justify-center w-full px-6 py-8 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-500 transition-all duration-200"
              >
                <div className="text-center">
                  <Upload className="mx-auto mb-2 text-purple-500" size={32} />
                  <p className="text-gray-700 font-semibold">Click to upload or drag & drop</p>
                  <p className="text-gray-500 text-sm">PNG, JPG, GIF up to 10MB</p>
                </div>
              </label>
            </div>
            {preview && (
              <img src={preview} alt="Preview" className="mt-4 w-full rounded-lg max-h-80 object-cover shadow-lg" />
            )}
          </div>

          {/* AI Caption Suggestions Section */}
          {image && (
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <AICaptionSuggestions
                imageFile={image}
                onCaptionSelect={handleCaptionSelect}
              />
            </div>
          )}

          {/* Caption Input Section */}
          <div className="mb-6">
            <label className="block mb-3 text-sm font-bold text-gray-700">✍️ Caption</label>
            <textarea
              placeholder="Write a caption or select an AI suggestion above..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full p-4 border-2 border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 bg-white font-medium"
              rows={4}
            />
            <p className="text-gray-500 text-xs mt-2">{caption.length} characters</p>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={loading || !image}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg py-4"
          >
            {loading ? '⏳ Sharing...' : '🚀 Share Post'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
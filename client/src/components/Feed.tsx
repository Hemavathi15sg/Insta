import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';
import { Plus, Sparkles } from 'lucide-react';

interface PostType {
  id: number;
  user_id: number;
  username: string;
  avatar: string;
  image_url: string;
  caption: string;
  likes_count: number;
  created_at: string;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts');
      setPosts(response.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 pt-20 pb-8">
      {/* Create Post Button */}
      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200 z-40 flex items-center justify-center"
        title="Create new post"
      >
        <Plus size={32} strokeWidth={3} />
      </button>

      {showCreatePost && (
        <CreatePost 
          onClose={() => setShowCreatePost(false)} 
          onPostCreated={fetchPosts}
        />
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-pink-500 to-purple-500 p-3 rounded-full mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Your Feed
          </h1>
          <p className="text-gray-600">Discover amazing posts from people you follow</p>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin">
              <Sparkles className="text-purple-500 mx-auto" size={40} />
            </div>
            <p className="text-gray-600 mt-4">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 card-gradient">
            <Sparkles size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No posts yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map(post => (
              <Post key={post.id} post={post} onDelete={handlePostDeleted} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;

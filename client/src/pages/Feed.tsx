import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../components/Post';
import CreatePost from '../components/CreatePost';

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

  const fetchPosts = async () => {
    try {
      const response = await axios.get('/api/posts');
      setPosts(response.data);
    } catch (err) {
      console.error('Failed to fetch posts', err);
    }
  };

  const handlePostDeleted = (postId: number) => {
    setPosts(posts.filter(post => post.id !== postId));
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50" style={{
      backgroundImage: `
        radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 0%, rgba(251, 146, 60, 0.08) 0%, transparent 60%)
      `,
      backgroundAttachment: 'fixed'
    }}>
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-200 to-transparent rounded-full opacity-20 blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-0 w-96 h-96 bg-gradient-to-br from-pink-200 to-transparent rounded-full opacity-20 blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-gradient-to-br from-orange-200 to-transparent rounded-full opacity-20 blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Header Section */}
      <div className="sticky top-16 z-40 bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 shadow-lg backdrop-blur-sm bg-opacity-95">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white tracking-wider">
              ✨ Your Feed
            </h1>
            <button
              onClick={() => setShowCreatePost(true)}
              className="bg-white text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-110 transition-transform px-4 py-2 rounded-lg font-bold flex items-center gap-2"
            >
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.5 1.5H9.5V9.5H1.5v1h8V18.5h1v-8h8v-1h-8V1.5z" clipRule="evenodd" />
              </svg>
              <span className="text-white">New Post</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-20 relative z-10">
        {/* Empty State */}
        {posts.length === 0 && !showCreatePost && (
          <div className="mt-16 text-center">
            <div className="inline-block mb-6 backdrop-blur-sm bg-white/80 p-12 rounded-2xl shadow-xl border border-white/20">
              <div className="text-6xl mb-4">📸</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                No posts yet
              </h2>
              <p className="text-gray-600 mb-8">Start by creating your first post!</p>
              <button
                onClick={() => setShowCreatePost(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition"
              >
                Create Post
              </button>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        {posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Post post={post} onDelete={handlePostDeleted} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all z-50 group"
      >
        <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost 
          onClose={() => setShowCreatePost(false)} 
          onPostCreated={fetchPosts}
        />
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Feed;
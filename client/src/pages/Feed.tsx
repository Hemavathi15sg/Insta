import React, { useState, useEffect, useCallback, memo } from 'react';
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

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);

  const fetchPosts = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/posts?page=${page}&limit=20`);
      
      // Handle both old and new API response formats
      if (response.data.posts) {
        // New paginated format
        setPosts(response.data.posts);
        setPagination(response.data.pagination);
      } else {
        // Old format (backward compatibility)
        setPosts(response.data);
        setPagination(null);
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePostDeleted = useCallback((postId: number) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  }, []);

  const handlePostCreated = useCallback(() => {
    fetchPosts(1);
    setShowCreatePost(false);
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50 to-pink-50">
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 pb-20 relative z-10 pt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            ✨ Your Feed
          </h1>
          <button
            onClick={() => setShowCreatePost(true)}
            className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition"
          >
            Create Post
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading posts...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && posts.length === 0 && (
          <div className="mt-16 text-center">
            <div className="inline-block mb-6 backdrop-blur-sm bg-white/80 p-12 rounded-2xl shadow-xl border border-white/20">
              <div className="text-6xl mb-4">📸</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                No posts yet
              </h2>
              <p className="text-gray-600 mb-8">Start by creating your first post!</p>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        {!loading && posts.length > 0 && (
          <div className="space-y-6">
            {posts.map((post) => (
              <Post key={post.id} post={post} onDelete={handlePostDeleted} />
            ))}
          </div>
        )}

        {/* Pagination Info */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-8 text-center text-gray-600">
            <p>Page {pagination.page} of {pagination.totalPages}</p>
            <p className="text-sm">{pagination.total} total posts</p>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost 
          onClose={() => setShowCreatePost(false)} 
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default memo(Feed);
import { useState, useCallback, useMemo, memo } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../styles/Post.css';

interface Comment {
  id: number;
  user_id: number;
  username: string;
  avatar: string;
  content: string;
  created_at: string;
}

interface PostProps {
  post: {
    id: number;
    user_id: number;
    username: string;
    avatar: string;
    image_url: string;
    caption: string;
    likes_count: number;
    created_at: string;
  };
  onDelete?: (postId: number) => void;
}

const Post: React.FC<PostProps> = ({ post, onDelete }) => {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsFetched, setCommentsFetched] = useState(false);
  
  // Memoize current user ID to avoid parsing on every render
  const currentUserId = useMemo(() => parseInt(localStorage.getItem('userId') || '0'), []);
  const isOwner = useMemo(() => currentUserId === post.user_id, [currentUserId, post.user_id]);

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const response = await axios.get(`/api/posts/${post.id}/comments`);
      setComments(response.data);
      setCommentsFetched(true);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoadingComments(false);
    }
  }, [post.id]);

  const handleLike = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/api/posts/${post.id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiked(!liked);
      setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    } catch (err) {
      console.error('Failed to like post', err);
    }
  }, [post.id, liked, likesCount]);

  const handleDelete = useCallback(async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (onDelete) {
        onDelete(post.id);
      }
    } catch (err) {
      console.error('Failed to delete post', err);
      alert('Failed to delete post. Please try again.');
    }
  }, [post.id, onDelete]);

  const handleCommentToggle = useCallback(() => {
    if (!showComments && !commentsFetched) {
      // Fetch comments only if we haven't fetched them before
      fetchComments();
    }
    setShowComments(!showComments);
  }, [showComments, commentsFetched, fetchComments]);

  const handleAddComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/posts/${post.id}/comments`,
        { content: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchComments();
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment', err);
      alert('Failed to add comment. Please try again.');
    }
  }, [newComment, post.id, fetchComments]);

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-t-4 border-gradient-to-r from-purple-500 via-pink-500 to-rose-500">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 hover:bg-gray-50 transition">
        <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition flex-1">
          <div className="relative">
            <img 
              src={post.avatar || '/default-avatar.png'} 
              alt={post.username}
              className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-3 border-gradient-to-r from-purple-400 to-pink-400"
            />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
          </div>
          <div className="min-w-0">
            <span className="font-bold text-gray-900 block">{post.username}</span>
            <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </Link>
        {isOwner && (
          <button 
            onClick={handleDelete} 
            className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition duration-200 flex-shrink-0"
            title="Delete post"
          >
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Image Container */}
      <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden relative group">
        <img 
          src={post.image_url} 
          alt={post.caption}
          loading="lazy"
          className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-transparent opacity-0 group-hover:opacity-10 transition-opacity"></div>
      </div>

      {/* Content */}
      <div className="px-6 py-4">
        {/* Action Buttons */}
        <div className="flex gap-6 mb-4 pb-4 border-b border-gray-100">
          <button 
            onClick={handleLike} 
            className={`transform hover:scale-125 transition-all duration-200 focus:outline-none ${
              liked 
                ? 'text-red-500 drop-shadow-lg' 
                : 'text-gray-700 hover:text-red-500'
            }`}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={32} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 2} />
          </button>
          <button 
            onClick={handleCommentToggle} 
            className="text-gray-700 hover:text-blue-500 transform hover:scale-125 transition-all duration-200 focus:outline-none"
            title="Comments"
          >
            <MessageCircle size={32} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="font-bold text-gray-900 mb-4 text-lg bg-gradient-to-r from-red-400 to-pink-500 bg-clip-text text-transparent">
          ❤️ {likesCount} {likesCount === 1 ? 'like' : 'likes'}
        </div>
        
        {/* Caption */}
        {post.caption && (
          <div className="mb-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border-l-4 border-gradient-to-b from-purple-500 to-pink-500">
            <span className="font-bold text-purple-700">{post.username}</span>
            <p className="text-gray-800 mt-2 leading-relaxed text-sm break-words">{post.caption}</p>
          </div>
        )}

        {/* View Comments Button */}
        {comments.length > 0 && !showComments && (
          <button 
            onClick={handleCommentToggle}
            className="text-blue-600 text-sm mb-3 font-semibold hover:text-blue-700 hover:underline transition"
          >
            💬 View all {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </button>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 border-t-2 border-gray-200 pt-4 bg-gray-50 -mx-6 -mb-4 px-6 py-4 rounded-b-2xl">
            {loadingComments ? (
              <p className="text-gray-500 text-sm text-center py-4 animate-pulse">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-500 text-sm mb-4 text-center italic">👉 Be the first to comment</p>
            ) : (
              <div className="space-y-3 mb-4 max-h-56 overflow-y-auto pr-2">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-3 hover:bg-white rounded-lg transition duration-200">
                    <img 
                      src={comment.avatar || '/default-avatar.png'} 
                      alt={comment.username}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-purple-300"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-sm text-gray-900">{comment.username}</span>
                        <span className="text-sm text-gray-700 break-words">{comment.content}</span>
                      </div>
                      <span className="text-xs text-gray-400 mt-1 block">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 text-sm"
              />
              <button 
                type="submit"
                disabled={!newComment.trim()}
                className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1 whitespace-nowrap"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// Memoize the Post component to prevent unnecessary re-renders
export default memo(Post);

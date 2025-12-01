import { useState } from 'react';
import axios from 'axios';
import { Heart, MessageCircle, Trash2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

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
  
  const currentUserId = parseInt(localStorage.getItem('userId') || '0');
  const isOwner = currentUserId === post.user_id;

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await axios.get(`/api/posts/${post.id}/comments`);
      setComments(response.data);
    } catch (err) {
      console.error('Failed to fetch comments', err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleLike = async () => {
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
  };

  const handleDelete = async () => {
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
  };

  const handleCommentToggle = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.FormEvent) => {
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
  };

  return (
    <div className="card-gradient overflow-hidden">
      {/* Header - Fixed Height */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-gray-100">
        <Link to={`/profile/${post.user_id}`} className="flex items-center gap-3 hover:opacity-80 transition">
          <img 
            src={post.avatar || '/default-avatar.png'} 
            alt={post.username}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-pink-200"
          />
          <div>
            <span className="font-bold text-gray-800 block">{post.username}</span>
            <span className="text-xs text-gray-500">{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </Link>
        {isOwner && (
          <button onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition">
            <Trash2 size={20} />
          </button>
        )}
      </div>

      {/* Image - Fixed Height with Better Object Fit */}
      <div className="w-full h-96 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
        <img 
          src={post.image_url} 
          alt={post.caption}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Content - Fixed Structure */}
      <div className="p-4">
        {/* Action Buttons */}
        <div className="flex gap-6 mb-4 text-gray-700">
          <button 
            onClick={handleLike} 
            className={`transform hover:scale-110 transition-all duration-200 ${liked ? 'text-red-500' : 'hover:text-red-500'}`}
            title={liked ? 'Unlike' : 'Like'}
          >
            <Heart size={28} fill={liked ? 'currentColor' : 'none'} strokeWidth={liked ? 0 : 2} />
          </button>
          <button 
            onClick={handleCommentToggle} 
            className="hover:text-blue-500 transform hover:scale-110 transition-all duration-200"
            title="Comments"
          >
            <MessageCircle size={28} />
          </button>
        </div>

        {/* Likes Count */}
        <div className="font-bold text-gray-800 mb-3 text-lg">
          ❤️ <span className="text-pink-600">{likesCount}</span> {likesCount === 1 ? 'like' : 'likes'}
        </div>
        
        {/* Caption - Max 2 lines with ellipsis */}
        {post.caption && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-pink-500">
            <span className="font-semibold text-gray-800">{post.username}</span>
            <p className="text-gray-700 mt-1 line-clamp-3">{post.caption}</p>
          </div>
        )}

        {/* View Comments Button */}
        {comments.length > 0 && !showComments && (
          <button 
            onClick={handleCommentToggle}
            className="text-purple-600 text-sm mb-3 font-semibold hover:text-purple-700"
          >
            👁️ View all {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
          </button>
        )}

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            {loadingComments ? (
              <p className="text-gray-500 text-sm text-center py-3">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-gray-500 text-sm mb-3 text-center">Be the first to comment</p>
            ) : (
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                    <img 
                      src={comment.avatar || '/default-avatar.png'} 
                      alt={comment.username}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-purple-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div>
                        <span className="font-semibold text-sm text-gray-800">{comment.username}</span>
                        <span className="text-sm text-gray-700 ml-2 break-words">{comment.content}</span>
                      </div>
                      <span className="text-xs text-gray-400">
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
                className="input-modern py-2"
              />
              <button 
                type="submit"
                className="px-4 py-2 btn-primary flex items-center gap-1 whitespace-nowrap"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Date */}
        <div className="text-gray-400 text-sm mt-2">
          {new Date(post.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default Post;

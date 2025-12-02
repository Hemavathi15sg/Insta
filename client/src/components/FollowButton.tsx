import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, UserCheck, AlertCircle } from 'lucide-react';

interface FollowButtonProps {
  userId: number;
  targetUserId: number;
  onFollowStatusChange?: (isFollowing: boolean) => void;
  className?: string;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  targetUserId,
  onFollowStatusChange,
  className = ''
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);

  // Check initial follow status on mount
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `/api/users/${userId}/following-status/${targetUserId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setIsFollowing(response.data.data.isFollowing);
      } catch (err) {
        console.error('Failed to check follow status', err);
      }
    };

    if (userId !== targetUserId) {
      checkFollowStatus();
    }
  }, [userId, targetUserId]);

  const handleFollowToggle = async () => {
    try {
      setLoading(true);
      setError(null);
      setShowError(false);

      const token = localStorage.getItem('token');

      if (isFollowing) {
        // Unfollow
        await axios.delete(
          `/api/users/${targetUserId}/follow`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      } else {
        // Follow
        await axios.post(
          `/api/users/${targetUserId}/follow`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }

      // Update state
      const newFollowingStatus = !isFollowing;
      setIsFollowing(newFollowingStatus);
      onFollowStatusChange?.(newFollowingStatus);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        'Failed to update follow status. Please try again.';
      setError(errorMessage);
      setShowError(true);
      console.error('Failed to follow/unfollow user', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleFollowToggle}
        disabled={loading}
        className={`
          px-6 py-2 rounded-lg font-semibold transition-all duration-300
          flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed
          ${
            isFollowing
              ? 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 hover:from-gray-300 hover:to-gray-400 shadow-md hover:shadow-lg'
              : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg'
          }
          ${className}
        `}
      >
        {loading ? (
          <>
            <span className="inline-block animate-spin">⏳</span>
            {isFollowing ? 'Unfollowing...' : 'Following...'}
          </>
        ) : (
          <>
            {isFollowing ? (
              <>
                <UserCheck size={18} />
                Following
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Follow
              </>
            )}
          </>
        )}
      </button>

      {showError && error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 w-full max-w-sm">
          <div className="flex items-start gap-2">
            <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-red-800 text-sm font-medium">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
            <button
              onClick={() => setShowError(false)}
              className="text-red-600 hover:text-red-800 flex-shrink-0 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowButton;

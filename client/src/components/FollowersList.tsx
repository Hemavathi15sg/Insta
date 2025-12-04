import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Users, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Follower {
  id: number;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  followedAt: string;
}

interface FollowersListProps {
  userId: number;
  onClose: () => void;
}

const FollowersList: React.FC<FollowersListProps> = ({ userId, onClose }) => {
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = 20;

  useEffect(() => {
    const fetchFollowers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `/api/users/${userId}/followers?page=${page}&limit=${limit}`
        );
        setFollowers(response.data.data.followers);
        setTotal(response.data.data.total);
        setTotalPages(response.data.data.totalPages);
      } catch (err: any) {
        const errorMessage =
          err.response?.data?.error || 'Failed to fetch followers';
        setError(errorMessage);
        console.error('Failed to fetch followers', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId, page]);

  const handlePrevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) setPage(page + 1);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-96 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <Users size={22} className="text-pink-600" />
            <h2 className="text-xl font-bold">Followers</h2>
            <span className="text-gray-600 text-sm">({total})</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                <p className="text-gray-600 text-sm mt-2">Loading followers...</p>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 flex items-start gap-3 bg-red-50 border-b border-red-200">
              <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium text-sm">{error}</p>
              </div>
            </div>
          ) : followers.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-600">
              <p className="text-center">No followers yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {followers.map((follower) => (
                <Link
                  key={follower.id}
                  to={`/profile/${follower.id}`}
                  onClick={onClose}
                  className="p-4 hover:bg-gray-50 transition-colors flex items-center gap-3"
                >
                  <img
                    src={follower.avatar || '/default-avatar.png'}
                    alt={follower.username}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">
                      {follower.username}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {follower.bio || 'No bio'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && !loading && !error && followers.length > 0 && (
          <div className="border-t border-gray-200 p-4 flex items-center justify-between bg-gray-50">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersList;

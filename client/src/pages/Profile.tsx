import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import FollowButton from '../components/FollowButton';
import FollowersList from '../components/FollowersList';
import BioModal from '../components/BioModal';

const Profile: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const currentUserId = parseInt(localStorage.getItem('userId') || '0');
  const isOwnProfile = currentUserId === parseInt(userId || '0');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/api/users/${userId}`);
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    };
    fetchUser();
  }, [userId]);

  if (!user) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto pt-20 pb-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center gap-8">
          <img 
            src={user.avatar || '/default-avatar.png'} 
            alt={user.username}
            className="w-32 h-32 rounded-full object-cover"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            <button
              onClick={() => setShowBioModal(true)}
              className="text-gray-600 hover:text-pink-600 transition-colors cursor-pointer mb-4 font-semibold inline-block px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              BIO
            </button>
            <div className="flex gap-8 items-center flex-wrap">
              <div><span className="font-bold">{user.posts?.length || 0}</span> posts</div>
              <button
                onClick={() => setShowFollowers(true)}
                className="hover:text-pink-600 transition-colors cursor-pointer"
              >
                <span className="font-bold text-gray-900">0</span>
                <span className="text-gray-600"> followers</span>
              </button>
              {!isOwnProfile && (
                <FollowButton 
                  userId={currentUserId}
                  targetUserId={parseInt(userId || '0')}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {showFollowers && (
        <FollowersList 
          userId={parseInt(userId || '0')}
          onClose={() => setShowFollowers(false)}
        />
      )}

      {showBioModal && (
        <BioModal
          user={user}
          onClose={() => setShowBioModal(false)}
        />
      )}

      <div className="grid grid-cols-3 gap-4">
        {user.posts?.map((post: any) => (
          <div key={post.id} className="aspect-square">
            <img 
              src={post.image_url} 
              alt={post.caption}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;
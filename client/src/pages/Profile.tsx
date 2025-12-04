import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Camera } from 'lucide-react';
import FollowButton from '../components/FollowButton';
import FollowersList from '../components/FollowersList';
import BioModal from '../components/BioModal';

const Profile: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<any>(null);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showBioModal, setShowBioModal] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setAvatarError('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('File size too large. Maximum size is 5MB.');
      return;
    }

    setAvatarError(null);
    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/users/me/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Update user avatar in state
        setUser({ ...user, avatar: response.data.data.avatar });
        
        // Update user in localStorage if it exists
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.avatar = response.data.data.avatar;
          localStorage.setItem('user', JSON.stringify(userData));
        }
      }
    } catch (err: any) {
      console.error('Failed to upload avatar', err);
      setAvatarError(err.response?.data?.error || 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (!user) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto pt-20 pb-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center gap-8">
          <div className="relative">
            <img 
              src={user.avatar || '/default-avatar.png'} 
              alt={user.username}
              className="w-32 h-32 rounded-full object-cover"
            />
            {isOwnProfile && (
              <label 
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-pink-600 text-white p-2 rounded-full cursor-pointer hover:bg-pink-700 transition-colors"
                title="Upload profile picture"
              >
                <Camera size={20} />
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploadingAvatar}
                />
              </label>
            )}
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="text-white text-sm">Uploading...</div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            {avatarError && (
              <div className="text-red-600 text-sm mb-2">{avatarError}</div>
            )}
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
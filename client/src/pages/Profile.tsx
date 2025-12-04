import React, { useState, useEffect, memo } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  bio: string;
  created_at: string;
  posts?: any[];
}

const Profile: React.FC = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/users/${userId}`);
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center mt-20">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center mt-20">
        <p className="text-gray-600">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-20 pb-8 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex items-center gap-8">
          <img 
            src={user.avatar || '/default-avatar.png'} 
            alt={user.username}
            loading="lazy"
            className="w-32 h-32 rounded-full object-cover"
          />
          <div>
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            <p className="text-gray-600 mb-4">{user.bio || 'No bio yet'}</p>
            <div className="flex gap-8">
              <div><span className="font-bold">{user.posts?.length || 0}</span> posts</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {user.posts?.map((post: any) => (
          <div key={post.id} className="aspect-square">
            <img 
              src={post.image_url} 
              alt={post.caption}
              loading="lazy"
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(Profile);
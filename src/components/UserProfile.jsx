import React, { useEffect, useState } from 'react';
import { getUserProfile } from '../api/api';
import { useAuth } from '../context/AuthContext';

const UserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState(user || null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

     if (isAuthenticated){
        UserProfile();
     }
      }, [isAuthenticated]);
   
  const UserProfile = async () => {
          try {
              const response = await getUserProfile();
              setProfileData(response.data);
              
          } catch (err) {
              console.error("Failed to fetch quizzes", err);
          } finally {
              setLoading(false);
          }
      };

  if (loading && !profileData) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="max-w-md mx-auto my-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 border-b pb-2">User Profile</h2>
      <div className="space-y-3">
        <p><strong>Username:</strong> {profileData?.username || "N/A"}</p>
        <p><strong>Email:</strong> {profileData?.email || "N/A"}</p>
        <p><strong>Role:</strong> <span className="uppercase text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{profileData?.role || "N/A"}</span></p>
      </div>
    </div>
  );
};

export default UserProfile;
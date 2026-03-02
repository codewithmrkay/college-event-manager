import React, { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom';
import { useUserStore } from '../store/user.store';

export const Dashboard = () => {
  const { user, getProfile } = useUserStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // If user already exists in store, no need to fetch again
      if (!user) {
        await getProfile();
      }
      setIsChecking(false);
    };
    checkAuth();
  }, [getProfile, user]);

  if (isChecking) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if ((user.role == "admin")) {
    return <Navigate to="/admin-dashboard" />;
  }
  return (
    <div>Dashboard</div>
  )
}

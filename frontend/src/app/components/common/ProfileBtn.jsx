import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/user.store';

const ProfileBtn = () => {
  const navigate = useNavigate();
    const { user, loading, getProfile } = useUserStore();

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

    const handleSignIn = () => {
        navigate('/signin');
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    // 1. Loading State: Show a ghost circle or small spinner
    if (loading) {
        return (
            <div className="w-12 h-12 rounded-full bg-base-300 animate-pulse flex items-center justify-center">
                <span className="loading loading-spinner loading-xs"></span>
            </div>
        );
    }

    // 2. Authenticated State: Show Avatar
    if (user) {
        // Dynamic placeholder based on gender
        const avatarUrl = user.profilePic
            ? user.profilePic
            : `https://avatar.iran.liara.run/public/${user.gender === 'female' ? 'girl' : 'boy'}?username=${user.name}`;

        return (
            <div
                className="avatar cursor-pointer hover:opacity-80 transition-all border-2 border-secondary rounded-full p-0.5"
                onClick={handleProfileClick}
            >
                <div className="w-10 rounded-full">
                    <img src={avatarUrl} alt="User Profile" />
                </div>
            </div>
        );
    }

    // 3. Unauthenticated State: Show Sign In Button
    return (
        <button
            onClick={handleSignIn}
            className='text-xl text-nowrap btn text-white btn-secondary btn-md'
        >
            Sign In
        </button>
    );
}

export default ProfileBtn
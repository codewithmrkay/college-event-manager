import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileBtn from '../common/ProfileBtn';

export const LoginBtn = ({ isMobile }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/events');
  };
  return (
    <div className='flex items-center justify-center gap-2'>
      <button onClick={handleLogin} className={`${isMobile ? 'w-full text-lg font-bold' : 'hidden lg:block text-xl text-nowrap'} btn border-2 border-gray-200 hover:bg-gray-100 text-gray-500 bg-gray-50 btn-md`}>
        Apply an Event
      </button>
      {!isMobile && (
        <div>
          <ProfileBtn />
        </div>
      )}
    </div>
  );
};

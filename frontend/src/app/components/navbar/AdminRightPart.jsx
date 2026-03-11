import React from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileBtn from '../common/ProfileBtn';
export const AdminRightPart = ({ isMobile }) => {
    const navigate = useNavigate();

    const handleCreateEvent = () => {
        navigate('/admin/events/create');
    };

    return (
        <div className='flex items-center justify-center gap-2'>
            <button onClick={handleCreateEvent} className={`${isMobile ? 'w-full text-lg font-bold' : 'hidden lg:block text-xl text-nowrap'} btn border-2 border-gray-200 hover:bg-gray-100 text-gray-500 bg-gray-50 btn-md`}>
                Create Event
            </button>
            {!isMobile && (
                <div>
                    <ProfileBtn />
                </div>
            )}
        </div>
    );
};

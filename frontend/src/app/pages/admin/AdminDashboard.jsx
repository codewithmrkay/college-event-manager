import React from 'react';

export const AdminDashboard = () => {
    return (
        <div className=" flex flex-col items-center justify-center w-full rounded-lg h-full">
            <h2 className="text-2xl font-bold text-gray-800">Welcome to Admin Dashboard</h2>
            <p className="text-gray-600">This page will show total events, pending status, and other high-level statistics.</p>
        </div>
    );
};

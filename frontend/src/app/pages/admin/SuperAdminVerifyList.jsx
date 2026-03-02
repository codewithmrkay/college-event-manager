import React from 'react';

export const SuperAdminVerifyList = () => {
    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-purple-700">Verify Events</h2>
            </div>
            <div className="bg-purple-50 rounded-lg shadow-sm border border-purple-100 p-6">
                <p className="text-gray-700">This page is for Super Admins only. It will list all submitted events waiting for verification.</p>
            </div>
        </div>
    );
};

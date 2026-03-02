import React from 'react';
import { Link } from 'react-router-dom';

export const AdminEventList = () => {
    return (
        <div className="space-y-6 p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">My Events</h2>
                <Link to="/admin/events/create" className="btn btn-primary btn-sm rounded-md px-4">
                    + New Event
                </Link>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <p className="text-gray-600">This page will list all events you are coordinating. You can see their verified/draft/rejected status here and fix rejected events.</p>
            </div>
        </div>
    );
};

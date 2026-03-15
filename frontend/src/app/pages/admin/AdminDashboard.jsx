import React, { useEffect, useMemo } from 'react';
import {
    Plus,
    Calendar,
    CheckCircle,
    Clock,
    FileText,
    ChevronRight,
    LayoutDashboard,
    AlertCircle,
    Users
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminEventStore } from '../../store/adminEvent.store';
import { useAuthStore } from '../../store/auth.store';
import { useUserStore } from '../../store/user.store';

export const AdminDashboard = () => {
    const { user } = useUserStore();
    const { events, fetchAdminEvents, loading } = useAdminEventStore();

    useEffect(() => {
        fetchAdminEvents();
    }, [fetchAdminEvents]);

    const stats = useMemo(() => {
        const published = events.filter(e => e.isVerified && !e.isDraft).length;
        const pending = events.filter(e => !e.isVerified && !e.isDraft).length;
        const drafts = events.filter(e => e.isDraft).length;
        const total = events.length;

        return [
            { label: 'Total Events', value: total, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
            { label: 'Published', value: published, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
            { label: 'Pending', value: pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
            { label: 'Drafts', value: drafts, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-100' },
        ];
    }, [events]);

    const recentEvents = useMemo(() => {
        return [...events].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 5);
    }, [events]);

    if (loading && events.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 w-full h-screen">
                <div className="loading loading-bars loading-xl text-purple-600"></div>
                <p className="mt-4 text-gray-500 text-2xl font-mangodolly font-medium animate-pulse">Loading your Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 py-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 font-mangodolly">
                        Welcome back, <span className='text-purple-600'> {user?.fullName?.split(' ')[0] || 'Admin'}!</span>
                    </h1>
                    <p className="text-gray-500 text-2xl font-medium mt-1">
                        Here's what's happening with your events today.
                    </p>
                </div>
                <Link
                    to="/admin/events/create"
                    className="btn btn-primary btn-lg bg-blue-500 hover:bg-blue-600 border-none rounded-md px-6 shadow-lg text-white"
                >
                    <Plus className="w-5 h-5 mr-2" /> Create New Event
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-xl font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <h3 className="text-3xl font-mangodolly font-black text-gray-700 mt-1">{stat.value}</h3>
                            </div>
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 font-sans">
                {/* Recent Activity Section */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                            <LayoutDashboard className="w-8 h-8 text-pink-500" /> Recent Events
                        </h2>
                        <Link to="/admin/events" className="text-xl font-bold text-blue-600 hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="bg-white border p-4 border-gray-100 rounded-md shadow-sm overflow-hidden">
                        {recentEvents.length > 0 ? (
                            <div className="flex items-start w-full justify-center flex-col gap-3">
                                {recentEvents.map((event) => (
                                    <div key={event._id} className="p-4 w-full hover:bg-gray-100 transition-colors group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="h-20 aspect-video rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {event.bannerImage ? (
                                                        <img src={event.bannerImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500">
                                                            <Calendar className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-2xl text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {event.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 mt-1 text-md font-sans">
                                                        <span className={`font-black uppercase px-4 py-1 rounded-full ${event.isDraft ? 'bg-purple-100 text-purple-600' :
                                                            event.isVerified ? 'bg-emerald-100 text-emerald-600' :
                                                                'bg-amber-100 text-amber-600'
                                                            }`}>
                                                            {event.isDraft ? 'Draft' : event.isVerified ? 'Live' : 'Pending'}
                                                        </span>
                                                        <span className="text-md text-gray-400 font-medium">
                                                            Updated {new Date(event.updatedAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/admin/events/${event._id}?preview=true`}
                                                className="p-2 hover:bg-white rounded-md text-gray-400 hover:text-blue-600 border border-transparent hover:border-gray-100 transition-all"
                                            >
                                                <ChevronRight className="w-8 h-8" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <LayoutDashboard className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 font-mangodolly">No events found</h3>
                                <p className="text-gray-500 max-w-xs mx-auto mt-1 text-lg">
                                    Start by creating your first event to see it appear here.
                                </p>
                                <Link to="/admin/events/create" className="btn btn-lg text-white bg-blue-500 hover:bg-blue-600 mt-6">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Quick Tools & Tips */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-md text-white shadow-xl">
                        <h3 className="font-bold text-2xl mb-2">Organizer's Corner</h3>
                        <p className="text-blue-100 text-lg leading-relaxed mb-6">
                            Verified events get 4x more engagement. Ensure your event has clear rules and high-quality banners.
                        </p>
                        <div className="space-y-3">
                            <Link to="/admin/events/create" className="btn btn-lg btn-soft flex items-center justify-between p-3  transition-colors group">
                                <span className="font-bold">New Draft</span>
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                            </Link>
                            <Link to="/admin/events" className="btn btn-lg btn-neutral flex items-center justify-between p-3 transition-colors group">
                                <span className="font-bold">Manage Events</span>
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-md border border-gray-100 shadow-sm">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-2xl">
                            <AlertCircle className="w-6 h-6 text-gray-400" /> Needs Attention
                        </h3>
                        <div className="space-y-4">
                            {events.filter(e => !e.isVerified && !e.isDraft && e.rejectionReason).length > 0 ? (
                                events.filter(e => !e.isVerified && !e.isDraft && e.rejectionReason).map(e => (
                                    <div key={e._id} className="p-3 bg-red-50 border border-red-100 rounded-xl">
                                        <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Rejected</p>
                                        <p className="text-sm font-bold text-gray-900 truncate">{e.title}</p>
                                        <p className="text-xs text-red-500 mt-1 line-clamp-2">{e.rejectionReason}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-sm text-gray-400 font-medium italic">No pending actions</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

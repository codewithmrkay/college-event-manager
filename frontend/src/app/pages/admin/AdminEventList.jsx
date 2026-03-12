import React, { useEffect, useState } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Eye,
    Edit3,
    Calendar,
    Clock,
    AlertCircle,
    CheckCircle2,
    Trash2,
    Users
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminEventStore } from '../../store/adminEvent.store';

export const AdminEventList = () => {
    const navigate = useNavigate();
    const { events, fetchAdminEvents, loading } = useAdminEventStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');

    useEffect(() => {
        fetchAdminEvents();
    }, [fetchAdminEvents]);

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
        if (activeFilter === 'all') return matchesSearch;
        if (activeFilter === 'draft') return matchesSearch && event.isDraft;
        if (activeFilter === 'pending') return matchesSearch && !event.isDraft && !event.isVerified;
        if (activeFilter === 'live') return matchesSearch && !event.isDraft && event.isVerified;
        if (activeFilter === 'rejected') return matchesSearch && event.rejectionReason;
        return matchesSearch;
    });

    const getStatusBadge = (event) => {
        if (event.isDraft) return (
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-md font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
                <Clock className="w-5 h-5" /> Draft
            </span>
        );
        if (event.isVerified) return (
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-md font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
                <CheckCircle2 className="w-5 h-5" /> Live
            </span>
        );
        if (event.rejectionReason) return (
            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-md font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
                <AlertCircle className="w-5 h-5" /> Rejected
            </span>
        );
        return (
            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-md font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
                <Clock className="w-5 h-5" /> Pending
            </span>
        );
    };

    return (
        <div className="max-w-7xl bg-base-300 min-h-screen mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500 py-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-mangodolly font-black text-gray-900">Manage Events</h1>
                    <p className="text-gray-500 font-medium text-2xl">Create, edit, and track the status of your events.</p>
                </div>
                <Link to="/admin/events/create" className="btn btn-primary btn-lg bg-blue-500 hover:bg-blue-600 border-none text-white ">
                    <Plus className="w-5 h-5 mr-2" /> New Event
                </Link>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center md:justify-between w-full mt-5 justify-between bg-white p-4 rounded-md border border-gray-100 shadow-sm">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search your events..."
                        className={`input font-semibold input-lg w-full border-2 focus:border-blue-500 focus:outline-none`}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 justify-end w-full pb-1 md:pb-0">
                    {['all', 'live', 'pending', 'draft', 'rejected'].map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`btn btn-md btn-primary border-none shadow font-bold capitalize transition-all whitespace-nowrap ${activeFilter === f
                                ? 'bg-blue-500 text-white '
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Event List */}
            <div className="bg-white rounded-md mt-5 border border-gray-100 shadow-sm overflow-hidden">
                {loading && filteredEvents.length === 0 ? (
                    <div className="p-20 text-center">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table table-lg w-full">
                            <thead>
                                <tr className="border-b border-gray-50 text-gray-500 font-black uppercase text-lg tracking-widest">
                                    <th className="bg-white">Event Detail</th>
                                    <th className="bg-white">Status</th>
                                    <th className="bg-white">Date Updated</th>
                                    <th className="bg-white text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredEvents.map((event) => (
                                    <tr key={event._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="bg-transparent">
                                            <div className="flex items-center gap-4">
                                                <div className="aspect-video h-20 rounded-md bg-gray-100 overflow-hidden flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                                    {event.bannerImage ? (
                                                        <img src={event.bannerImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-blue-50 flex items-center justify-center text-blue-500">
                                                            <Calendar className="w-8 h-8" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="max-w-[200px] md:max-w-md">
                                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-xl">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-md text-gray-500 line-clamp-1 font-medium">{event.category} • {event.eventType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="bg-transparent">
                                            {getStatusBadge(event)}
                                        </td>
                                        <td className="bg-transparent font-medium text-gray-500 text-md">
                                            {new Date(event.updatedAt).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="bg-transparent text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => window.open(`/admin/events/${event._id}?preview=true`, '_blank')}
                                                    className="btn btn-ghost btn-sm  hover:bg-blue-50 hover:text-blue-600"
                                                    title="Preview"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <Link
                                                    to={`/admin/events/${event._id}/participants`}
                                                    className="btn btn-ghost btn-sm hover:bg-purple-50 hover:text-purple-600"
                                                    title="Participants"
                                                >
                                                    <Users className="w-5 h-5" />
                                                </Link>
                                                <Link
                                                    to={`/admin/events/edit/${event._id}`}
                                                    className="btn btn-ghost btn-sm  hover:bg-green-50 hover:text-green-600"
                                                    title="Edit"
                                                >
                                                    <Edit3 className="w-5 h-5" />
                                                </Link>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                                                            await import('../../store/adminEvent.store').then(m => m.useAdminEventStore.getState().deleteEvent(event._id));
                                                        }
                                                    }}
                                                    className="btn btn-ghost btn-sm  hover:bg-amber-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5 text-red-500" />
                                                </button>

                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">No events found</h3>
                        <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium">
                            {searchTerm ? `We couldn't find any events matching "${searchTerm}"` : "You haven't created any events yet."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

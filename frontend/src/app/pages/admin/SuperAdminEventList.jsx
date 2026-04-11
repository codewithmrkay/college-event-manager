import React, { useEffect, useState } from 'react';
import {
    Search,
    Calendar,
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    Eye,
    CalendarCheck,
    AlertCircle,
    Filter,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSuperAdminStore } from '../../store/superAdmin.store';

const FILTERS = ['pending', 'all', 'verified', 'rejected'];

const filterLabels = {
    all: 'All',
    pending: 'Pending',
    verified: 'Approved',
    rejected: 'Rejected',
};

const getStatusBadge = (event) => {
    if (event.isDraft) return (
        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Clock className="w-4 h-4" /> Draft
        </span>
    );
    if (event.isVerified) return (
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-4 h-4" /> Approved
        </span>
    );
    if (event.rejectionReason) return (
        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <XCircle className="w-4 h-4" /> Rejected
        </span>
    );
    return (
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Clock className="w-4 h-4" /> Pending
        </span>
    );
};

export const SuperAdminEventList = () => {
    const { events, fetchEvents, loading } = useSuperAdminStore();
    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState('pending');

    useEffect(() => {
        // Fetch submitted (non-draft) events. Fetch all then filter client-side for simplicity.
        fetchEvents({ isDraft: false });
    }, [fetchEvents]);

    const filteredEvents = events.filter((event) => {
        const matchesSearch = event.title.toLowerCase().includes(search.toLowerCase());
        if (!matchesSearch) return false;
        if (activeFilter === 'pending') return !event.isDraft && !event.isVerified && !event.rejectionReason;
        if (activeFilter === 'verified') return event.isVerified;
        if (activeFilter === 'rejected') return !!event.rejectionReason && !event.isVerified;
        return true; // 'all'
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 py-10 w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/super-admin/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-purple-600 text-sm font-bold mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 font-mangodolly flex items-center gap-3">
                        <CalendarCheck className="w-8 h-8 text-purple-500" /> Event Verification
                    </h1>
                    <p className="text-gray-500 font-medium text-xl mt-1">
                        Review submitted events and publish or reject them.
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search events..."
                        className="input input-lg w-full border-2 focus:border-purple-500 focus:outline-none pl-10 font-semibold"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 flex-wrap justify-end flex-shrink-0">
                    <Filter className="w-5 h-5 text-gray-400 self-center" />
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setActiveFilter(f)}
                            className={`btn btn-sm font-bold whitespace-nowrap border-none shadow transition-all ${activeFilter === f
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {filterLabels[f]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Event List */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading && filteredEvents.length === 0 ? (
                    <div className="p-20 text-center">
                        <span className="loading loading-spinner loading-lg text-purple-600" />
                    </div>
                ) : filteredEvents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table table-lg w-full">
                            <thead>
                                <tr className="border-b border-gray-50 text-gray-400 font-black uppercase text-sm tracking-widest">
                                    <th className="bg-white">Event</th>
                                    <th className="bg-white">Category</th>
                                    <th className="bg-white">Coordinator</th>
                                    <th className="bg-white">Submitted</th>
                                    <th className="bg-white">Status</th>
                                    <th className="bg-white text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredEvents.map((event) => (
                                    <tr key={event._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="bg-transparent">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 aspect-video rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                    {event.bannerImage ? (
                                                        <img src={event.bannerImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-purple-50 flex items-center justify-center text-purple-400">
                                                            <Calendar className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="max-w-[220px]">
                                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors line-clamp-1">
                                                        {event.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-400 font-medium">{event.eventType}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="bg-transparent">
                                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                                {event.category}
                                            </span>
                                        </td>
                                        <td className="bg-transparent font-semibold text-gray-600 text-sm">
                                            {event.coordinators?.[0]?.fullName || '—'}
                                        </td>
                                        <td className="bg-transparent text-gray-400 font-medium text-sm">
                                            {new Date(event.updatedAt).toLocaleDateString('en-IN', {
                                                day: 'numeric', month: 'short', year: 'numeric'
                                            })}
                                        </td>
                                        <td className="bg-transparent">
                                            {getStatusBadge(event)}
                                        </td>
                                        <td className="bg-transparent text-right">
                                            <Link
                                                to={`/super-admin/events/${event._id}`}
                                                className="btn btn-sm bg-purple-50 hover:bg-purple-100 text-purple-700 border-none font-bold gap-2"
                                            >
                                                <Eye className="w-4 h-4" /> Review
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <div className="bg-emerald-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CalendarCheck className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {activeFilter === 'pending' ? 'All caught up!' : 'No events found'}
                        </h3>
                        <p className="text-gray-500 mt-2 font-medium">
                            {activeFilter === 'pending'
                                ? 'No events are waiting for your review.'
                                : 'Try a different filter.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

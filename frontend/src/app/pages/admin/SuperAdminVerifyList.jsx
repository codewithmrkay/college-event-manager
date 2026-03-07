import React, { useEffect, useState } from 'react';
import {
    ShieldCheck,
    CheckCircle,
    XCircle,
    Eye,
    Search,
    Calendar,
    User,
    AlertTriangle,
    MessageSquare
} from 'lucide-react';
import { useAdminEventStore } from '../../store/adminEvent.store';
import toast from 'react-hot-toast';

export const SuperAdminVerifyList = () => {
    const { events, fetchAllEvents, verifyEvent, loading } = useAdminEventStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchAllEvents({ isVerified: false });
    }, [fetchAllEvents]);

    const submittedEvents = events.filter(e => !e.isDraft && !e.isVerified);

    const filteredEvents = submittedEvents.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleVerify = async (id, isApproved) => {
        if (!isApproved && !rejectionReason) {
            toast.error('Please provide a reason for rejection');
            return;
        }

        const toastId = toast.loading(isApproved ? 'Approving event...' : 'Rejecting event...');
        try {
            await verifyEvent(id, isApproved, isApproved ? null : rejectionReason);
            toast.success(isApproved ? 'Event approved and published!' : 'Event rejected.', { id: toastId });
            setSelectedEvent(null);
            setRejectionReason('');
            fetchAllEvents({ isVerified: false }); // Refresh list
        } catch (error) {
            toast.error(error.message || 'Verification failed', { id: toastId });
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-purple-600" /> Verify Events
                    </h1>
                    <p className="text-gray-500 font-medium">Review and publish events submitted by coordinators.</p>
                </div>
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search submissions..."
                        className="input w-full pl-10 bg-white border-gray-200 focus:border-purple-500 rounded-xl font-medium shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-6">
                {loading && filteredEvents.length === 0 ? (
                    <div className="p-20 text-center">
                        <span className="loading loading-spinner loading-lg text-purple-600"></span>
                    </div>
                ) : filteredEvents.length > 0 ? (
                    filteredEvents.map((event) => (
                        <div key={event._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                {/* Event Banner/Icon */}
                                <div className="w-full md:w-64 h-40 rounded-2xl bg-gray-100 overflow-hidden flex-shrink-0 shadow-inner">
                                    {event.bannerImage ? (
                                        <img src={event.bannerImage} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-purple-50 flex items-center justify-center text-purple-500">
                                            <Calendar className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {event.category}
                                        </span>
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {event.eventType}
                                        </span>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900">{event.title}</h2>
                                        <p className="text-gray-500 font-medium line-clamp-2 mt-1">{event.description}</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <User className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <span>By: {event.coordinators?.[0]?.fullName || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-medium text-gray-600">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                            </div>
                                            <span>Submitted: {new Date(event.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-row md:flex-col gap-3 justify-center">
                                    <button
                                        onClick={() => window.open(`/admin/events/${event._id}?preview=true`, '_blank')}
                                        className="btn btn-ghost border border-gray-100 rounded-2xl md:w-40 hover:bg-gray-50 bg-white"
                                    >
                                        <Eye className="w-5 h-5 mr-2" /> Preview
                                    </button>
                                    <button
                                        onClick={() => handleVerify(event._id, true)}
                                        className="btn bg-emerald-500 hover:bg-emerald-600 border-none text-white rounded-2xl md:w-40 shadow-lg shadow-emerald-200"
                                    >
                                        <CheckCircle className="w-5 h-5 mr-2" /> Approve
                                    </button>
                                    <button
                                        onClick={() => setSelectedEvent(event._id)}
                                        className="btn bg-red-500 hover:bg-red-600 border-none text-white rounded-2xl md:w-40 shadow-lg shadow-red-200"
                                    >
                                        <XCircle className="w-5 h-5 mr-2" /> Reject
                                    </button>
                                </div>
                            </div>

                            {/* Rejection Tray */}
                            {selectedEvent === event._id && (
                                <div className="bg-red-50 border-t border-red-100 p-6 md:px-8 animate-in slide-in-from-top-4 duration-300">
                                    <div className="max-w-3xl space-y-4">
                                        <div className="flex items-center gap-2 text-red-700 font-bold">
                                            <AlertTriangle className="w-5 h-5" />
                                            Reason for Rejection
                                        </div>
                                        <div className="relative">
                                            <textarea
                                                className="textarea textarea-bordered w-full rounded-2xl focus:border-red-500 min-h-[100px] text-gray-800 font-medium"
                                                placeholder="Explain why this event is being rejected. The coordinator will see this message."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                            />
                                            <div className="flex justify-end gap-3 mt-4">
                                                <button
                                                    onClick={() => { setSelectedEvent(null); setRejectionReason(''); }}
                                                    className="btn btn-ghost text-gray-500 font-bold"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(event._id, false)}
                                                    className="btn bg-red-600 hover:bg-red-700 border-none text-white px-8 rounded-xl font-black"
                                                >
                                                    Confirm Rejection
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-3xl border border-dashed border-gray-300 p-20 text-center">
                        <div className="bg-emerald-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-12 h-12 text-emerald-500" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">All caught up!</h3>
                        <p className="text-gray-500 max-w-sm mx-auto font-medium mt-2">
                            There are no pending events waiting for your verification right now.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

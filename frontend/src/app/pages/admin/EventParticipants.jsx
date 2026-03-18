import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users, User, Mail, Hash, Building2,
    MapPin, CheckCircle, XCircle, Search,
    ArrowLeft, Download, QrCode, Loader2,
    Phone, Smartphone, Trash2
} from 'lucide-react';
import { getEventParticipants, markAttendance } from '../../services/event.services';
import { useAdminEventStore } from '../../store/adminEvent.store';
import QRScannerModal from '../../components/admin/QRScannerModal';
import toast from 'react-hot-toast';

export const EventParticipants = () => {
    const { idOrSlug } = useParams();
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [markingId, setMarkingId] = useState(null);
    const [showScanner, setShowScanner] = useState(false);

    const { fetchEventById } = useAdminEventStore();

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Load event details to get the proper ID if slug was used
            const eventData = await fetchEventById(idOrSlug);
            setEvent(eventData);

            // 2. Load participants using the event ID
            const participantData = await getEventParticipants(eventData._id);
            setParticipants(participantData.participants || []);
        } catch (error) {
            console.error('Failed to load participants:', error);
            toast.error('Failed to load participant list');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [idOrSlug]);

    const handleAttendanceMarked = (registrationId) => {
        setParticipants(prev =>
            prev.map(p => p._id === registrationId ? { ...p, attended: true } : p)
        );
    };

    const handleToggleAttendance = async (registrationId, currentStatus) => {
        setMarkingId(registrationId);
        try {
            await markAttendance(registrationId, !currentStatus);
            toast.success(`Attendance marked as ${!currentStatus ? 'Present' : 'Absent'}`);
            // Update local state
            setParticipants(prev =>
                prev.map(p => p._id === registrationId ? { ...p, attended: !currentStatus } : p)
            );
        } catch (error) {
            toast.error('Failed to update attendance');
        } finally {
            setMarkingId(null);
        }
    };

    const filteredParticipants = participants.filter(p => {
        const s = searchTerm.toLowerCase();
        const student = p.student || {};
        return (
            (student.fullName?.toLowerCase() || '').includes(s) ||
            (student.email?.toLowerCase() || '').includes(s) ||
            (student.rollNo?.toLowerCase() || '').includes(s)
        );
    });

    const stats = {
        total: participants.length,
        present: participants.filter(p => p.attended).length,
        absent: participants.filter(p => !p.attended && p.status !== 'cancelled').length,
        cancelled: participants.filter(p => p.status === 'cancelled').length,
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 w-full h-screen">
                <div className="loading loading-bars loading-xl text-purple-600"></div>
                <p className="mt-4 text-gray-500 text-2xl font-mangodolly font-medium animate-pulse">Loading Participant data...</p>
            </div>
        );
    }

    return (
        <div className="bg-base-300 min-h-screen animate-in fade-in duration-500">
            <div className="max-w-7xl mx-auto space-y-8 py-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center gap-2 text-gray-500 cursor-pointer hover:text-blue-600 font-bold text-xl transition-colors mb-4"
                        >
                            <ArrowLeft className="w-5 h-5" /> Back to Events
                        </button>
                        <h1 className="text-3xl font-black text-gray-900 font-mangodolly flex items-center gap-3">
                            <Users className="w-8 h-8 text-pink-500" />
                            Participants List
                        </h1>
                        <p className="text-gray-500 text-2xl font-medium mt-1 border-l-4 font-mangodolly pl-4 mt-4 border-blue-500">
                            {event?.title || "Loading event details..."}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowScanner(true)}
                            className="btn btn-outline border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-md flex items-center gap-2 px-6"
                        >
                            <QrCode className="w-5 h-5" /> Scan QR
                        </button>
                        <button className="btn btn-primary bg-blue-500 hover:bg-blue-600 border-none text-white rounded-md flex items-center gap-2 px-6 shadow-lg">
                            <Download className="w-5 h-5" /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Registered', value: stats.total, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
                        { label: 'Present', value: stats.present, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
                        { label: 'Absent', value: stats.absent, icon: XCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
                        { label: 'Cancelled', value: stats.cancelled, icon: Trash2, color: 'text-gray-500', bg: 'bg-gray-100' },
                    ].map((stat, idx) => (
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

                {/* Main Content Area */}
                <div className="space-y-4">
                    {/* Search & Toolbar */}
                    <div className="bg-white p-4 rounded-md border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-4 items-center">
                        <div className="relative w-full max-w-xl">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or roll number..."
                                className="input input-lg w-full pl-12 bg-gray-50 border-2 focus:border-blue-500 focus:outline-none font-semibold text-gray-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 text-md font-bold text-gray-500">
                            Showing {filteredParticipants.length} of {stats.total} entries
                        </div>
                    </div>

                    {/* Table Container */}
                    <div className="bg-white border border-gray-100 rounded-md shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="table w-full border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="py-5 pl-8 text-[12px] font-black uppercase tracking-[0.2em] text-gray-500">Student</th>
                                        <th className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-500">College Info</th>
                                        <th className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-500">Contact</th>
                                        <th className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-500">Status</th>
                                        <th className="text-center pr-8 text-[12px] font-black uppercase tracking-[0.2em] text-gray-500">Attendance</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredParticipants.length > 0 ? (
                                        filteredParticipants.map((p) => (
                                            <tr key={p._id} className={`hover:bg-gray-50/50 transition-colors group ${p.status === 'cancelled' ? 'opacity-60 grayscale' : ''}`}>
                                                <td className="py-6 pl-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden shadow-sm flex-shrink-0 bg-gray-100 border border-gray-200 group-hover:scale-105 transition-transform">
                                                            <img
                                                                src={p.student?.profilePic || `https://ui-avatars.com/api/?name=${p.student?.fullName || 'S'}&background=random`}
                                                                alt={p.student?.fullName}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{p.student?.fullName || 'Deleted Account'}</p>
                                                            <p className="text-sm text-gray-400 font-medium">{p.student?.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="space-y-1">
                                                        <p className="text-md font-bold text-gray-700 flex items-center gap-1.5">
                                                            <Hash className="w-4 h-4 text-blue-500" /> {p.student?.rollNo || 'N/A'}
                                                        </p>
                                                        <p className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                                                            <Building2 className="w-4 h-4 text-purple-400" /> {p.student?.department} • {p.student?.class}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="space-y-1">
                                                        <p className="text-md font-bold text-gray-700 flex items-center gap-1.5">
                                                            <Smartphone className="w-4 h-4 text-emerald-500" /> {p.student?.phoneNumber || 'N/A'}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td>
                                                    {p.status === 'confirmed' ? (
                                                        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                                            Cancelled
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="text-center pr-8">
                                                    {p.status !== 'cancelled' ? (
                                                        <button
                                                            onClick={() => handleToggleAttendance(p._id, p.attended)}
                                                            disabled={markingId === p._id}
                                                            className={`btn btn-lg px-4 min-w-[120px] font-sans font-semibold text-md transition-all border-none ${p.attended
                                                                ? 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                                                                : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                                                }`}
                                                        >
                                                            {markingId === p._id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : p.attended ? (
                                                                <div className="flex items-center gap-1.5">
                                                                    <CheckCircle className="w-3.5 h-3.5" /> Present
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-1.5">
                                                                    <XCircle className="w-3.5 h-3.5 opacity-50" /> Mark Present
                                                                </div>
                                                            )}
                                                        </button>
                                                    ) : (
                                                        <span className="text-sm text-gray-400 font-bold italic">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-24 text-center">
                                                <div className="flex flex-col items-center justify-center text-gray-300">
                                                    <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                                                        <Users className="w-10 h-10 opacity-20" />
                                                    </div>
                                                    <p className="text-2xl font-bold text-gray-900">No participants found</p>
                                                    <p className="text-gray-500 mt-2 max-w-sm mx-auto font-medium">
                                                        Try a different search term or check if anyone has registered for this event.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <QRScannerModal
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                participants={participants}
                onAttendanceMarked={handleAttendanceMarked}
            />
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Users, User, Mail, Hash, Building2,
    MapPin, CheckCircle, XCircle, Search,
    ArrowLeft, Download, QrCode, Loader2,
    Phone, Smartphone
} from 'lucide-react';
import { getEventParticipants, markAttendance } from '../../services/event.services';
import { useAdminEventStore } from '../../store/adminEvent.store';
import toast from 'react-hot-toast';

export const EventParticipants = () => {
    const { idOrSlug } = useParams();
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [markingId, setMarkingId] = useState(null);

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
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                <p className="mt-4 text-gray-500 font-medium">Loading participants...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8 py-8 px-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold text-sm transition-colors mb-2"
                    >
                        <ArrowLeft className="w-4 h-4" /> Back to Events
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <Users className="w-8 h-8 text-purple-600" />
                        Participants List
                    </h1>
                    <p className="text-gray-500 text-lg font-medium italic">
                        {event?.title}
                    </p>
                </div>

                <div className="flex gap-2">
                    {/* Future: QR Scanning button could go here */}
                    <button className="btn btn-outline border-purple-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300 rounded-2xl flex items-center gap-2">
                        <QrCode className="w-5 h-5" /> Scan QR
                    </button>
                    <button className="btn btn-primary bg-purple-600 hover:bg-purple-700 border-none text-white rounded-2xl flex items-center gap-2 shadow-lg shadow-purple-100">
                        <Download className="w-5 h-5" /> Export CSV
                    </button>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Registered', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Present', value: stats.present, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Absent', value: stats.absent, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Cancelled', value: stats.cancelled, color: 'text-gray-500', bg: 'bg-gray-100' },
                ].map((s, idx) => (
                    <div key={idx} className={`${s.bg} p-6 rounded-3xl border border-transparent hover:border-white transition-all`}>
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">{s.label}</p>
                        <h3 className={`text-4xl font-black ${s.color}`}>{s.value}</h3>
                    </div>
                ))}
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                {/* Search & Toolbar */}
                <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or roll number..."
                            className="input w-full pl-12 bg-gray-50 border-gray-100 rounded-2xl focus:bg-white focus:border-purple-300 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="table w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50 uppercase text-[10px] font-black tracking-[0.2em] text-gray-400">
                                <th className="py-5 pl-8">Student</th>
                                <th>College Info</th>
                                <th>Contact</th>
                                <th>Status</th>
                                <th className="text-center pr-8">Attendance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredParticipants.length > 0 ? (
                                filteredParticipants.map((p) => (
                                    <tr key={p._id} className={`hover:bg-purple-50/30 transition-colors ${p.status === 'cancelled' ? 'opacity-50 grayscale italic' : ''}`}>
                                        <td className="py-6 pl-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-md flex-shrink-0 bg-gray-100 border-2 border-white">
                                                    <img
                                                        src={p.student?.profilePic || `https://ui-avatars.com/api/?name=${p.student?.fullName || 'S'}&background=random`}
                                                        alt={p.student?.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-base">{p.student?.fullName || 'Deleted Account'}</p>
                                                    <p className="text-xs text-gray-500 font-bold">{p.student?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                                    <Hash className="w-3.5 h-3.5 text-blue-500" /> {p.student?.rollNo || 'N/A'}
                                                </p>
                                                <p className="text-xs text-gray-500 flex items-center gap-1.5">
                                                    <Building2 className="w-3.5 h-3.5 text-purple-400" /> {p.student?.department} • {p.student?.class}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                                    <Smartphone className="w-3.5 h-3.5 text-green-500" /> {p.student?.phoneNumber || 'N/A'}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            {p.status === 'confirmed' ? (
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    Cancelled
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-center pr-8">
                                            {p.status !== 'cancelled' ? (
                                                <button
                                                    onClick={() => handleToggleAttendance(p._id, p.attended)}
                                                    disabled={markingId === p._id}
                                                    className={`btn btn-sm rounded-xl px-4 border-none font-black text-xs transition-all shadow-sm ${p.attended
                                                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
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
                                                <span className="text-xs text-gray-400 font-bold">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <Users className="w-16 h-16 opacity-10 mb-4" />
                                            <p className="text-xl font-bold">No participants match your search</p>
                                            <p className="font-medium">Try a different search term or check if anyone has registered.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
    Calendar, MapPin, Users, Ticket,
    Award, Shield, Clock, Info,
    User, Mail, ArrowLeft, RefreshCw,
    CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { useAdminEventStore } from '../store/adminEvent.store';
import { getPublicEventBySlug, applyToEvent, getMyApplications } from '../services/event.services';
import { useUserStore } from '../store/user.store';
import toast from 'react-hot-toast';

const EventDetails = () => {
    const { idOrSlug } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const isPreview = queryParams.get('preview') === 'true';

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [myRegistration, setMyRegistration] = useState(null); // null | registration object
    const [authChecked, setAuthChecked] = useState(false);
    const { fetchEventById } = useAdminEventStore();
    const { user, loading: authLoading, getProfile } = useUserStore();

    const loadEventData = async () => {
        setLoading(true);
        try {
            if (isPreview) {
                const data = await fetchEventById(idOrSlug);
                setEvent(data);
            } else {
                const data = await getPublicEventBySlug(idOrSlug);
                setEvent(data.event);
            }
        } catch (error) {
            console.error('Error loading event:', error);
            toast.error('Failed to load event details');
        } finally {
            setLoading(false);
        }
    };

    // Check if the logged-in student has already applied to this event
    const checkMyRegistration = async (eventId) => {
        if (!user || isPreview) return;
        try {
            const { registrations } = await getMyApplications();
            const found = registrations.find(
                (r) => r.event?._id === eventId || r.event === eventId
            );
            setMyRegistration(found || null);
        } catch {
            // silently fail — not critical
        }
    };

    useEffect(() => {
        loadEventData();
    }, [idOrSlug, isPreview]);

    // Resolve auth state once after mount if not yet known
    useEffect(() => {
        const resolveAuth = async () => {
            if (!user && !authLoading) {
                await getProfile();
            }
            setAuthChecked(true);
        };
        resolveAuth();
    }, []);

    useEffect(() => {
        if (event?._id) {
            checkMyRegistration(event._id);
        }
    }, [event, user]);

    const handleApply = async () => {
        // If auth is still resolving, wait for it first
        if (!authChecked || authLoading) {
            return;
        }
        if (!user) {
            toast.error('Please sign in to apply for events');
            navigate('/signin');
            return;
        }
        setApplying(true);
        try {
            const res = await applyToEvent(event._id);
            toast.success(res.message || 'Successfully applied!');
            // Refresh registration state
            await checkMyRegistration(event._id);
        } catch (error) {
            const msg = error.response?.data?.message || 'Failed to apply. Please try again.';
            toast.error(msg);
        } finally {
            setApplying(false);
        }
    };

    // Determine the Register button state
    const getRegisterButton = () => {
        if (!event) return null;

        // Auth still loading — show spinner to avoid flicker
        if (!authChecked || authLoading) {
            return (
                <button disabled className="btn btn-lg btn-primary rounded-2xl px-12 text-lg opacity-60 cursor-not-allowed">
                    <Loader2 className="w-5 h-5 animate-spin" />
                </button>
            );
        }

        // Already applied (active)
        if (myRegistration && myRegistration.status !== 'cancelled') {
            return (
                <button
                    disabled
                    className="btn btn-lg rounded-2xl px-10 text-lg bg-green-500 text-white border-none cursor-not-allowed flex items-center gap-2"
                >
                    <CheckCircle className="w-5 h-5" />
                    Applied ✓
                </button>
            );
        }

        // Registration closed
        if (!event.isRegistrationOpen) {
            return (
                <button
                    disabled
                    className="btn btn-lg rounded-2xl px-10 text-lg bg-gray-300 text-gray-500 border-none cursor-not-allowed"
                >
                    Registration Closed
                </button>
            );
        }

        // Full
        if (event.maxParticipants && event.currentParticipants >= event.maxParticipants) {
            return (
                <button
                    disabled
                    className="btn btn-lg rounded-2xl px-10 text-lg bg-red-100 text-red-500 border-none cursor-not-allowed"
                >
                    <XCircle className="w-5 h-5 mr-2" />
                    Event Full
                </button>
            );
        }

        // Default: register
        return (
            <button
                onClick={handleApply}
                disabled={applying}
                className="btn btn-lg btn-primary rounded-2xl px-12 text-lg shadow-2xl shadow-purple-500/30 hover:scale-105 transition-transform disabled:opacity-70 disabled:scale-100"
            >
                {applying ? (
                    <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Applying...</>
                ) : (
                    'Register Now'
                )}
            </button>
        );
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <div className="loading loading-spinner loading-lg text-purple-600"></div>
                <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading event details...</p>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full">
                    <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Info className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h2>
                    <p className="text-gray-500 mb-8">The event you're looking for doesn't exist or you don't have permission to view it.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="btn btn-primary w-full rounded-2xl"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" /> Go Back
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Preview Banner */}
            {isPreview && (
                <div className="bg-amber-500 text-white py-2 px-4 flex items-center justify-between sticky top-0 z-50 shadow-md">
                    <div className="flex items-center gap-2 font-bold uppercase tracking-wider text-sm">
                        <Shield className="w-4 h-4" />
                        Preview Mode - Viewing Draft
                    </div>
                    <button
                        onClick={loadEventData}
                        className="btn btn-xs bg-white/20 border-none text-white hover:bg-white/30 rounded-lg flex items-center gap-1"
                    >
                        <RefreshCw className="w-3 h-3" /> Refresh
                    </button>
                </div>
            )}

            {/* Banner Section */}
            <div className="relative h-[40vh] md:h-[50vh] w-full overflow-hidden">
                {event.bannerImage ? (
                    <img
                        src={event.bannerImage}
                        alt={event.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-6">
                        <h1 className="text-4xl md:text-6xl font-black text-white text-center max-w-4xl drop-shadow-2xl">
                            {event.title}
                        </h1>
                    </div>
                )}
                {/* Glassmorphism Header Overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6 md:p-12">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/30">
                                    {event.category || 'Event'}
                                </span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-widest border border-white/30">
                                    {event.eventType || 'Other'}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-5xl font-black text-white drop-shadow-lg mb-2">
                                {event.title}
                            </h1>
                            <div className="flex items-center text-white/90 gap-4 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                    <MapPin className="w-4 h-4 text-purple-400" />
                                    <span className="font-medium">{event.isOnline ? 'Online Event' : (event.venue || 'TBD')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4 text-purple-400" />
                                    <span className="font-medium">{formatDate(event.eventStartDate)}</span>
                                </div>
                            </div>
                        </div>
                        {!isPreview && (
                            <div className="flex-shrink-0">
                                {getRegisterButton()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-12">
                    {/* About */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Info className="w-6 h-6 text-purple-600" /> About Event
                        </h2>
                        <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            {event.description}
                        </div>
                    </section>

                    {/* Rules & Eligibility */}
                    <div className="grid md:grid-cols-2 gap-8 text-gray-600">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Shield className="w-6 h-6 text-blue-600" /> Rules
                            </h2>
                            <ul className="space-y-3 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                                {event.rules?.length > 0 ? event.rules.map((rule, idx) => (
                                    <li key={idx} className="flex gap-3">
                                        <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-blue-500" />
                                        <span>{rule}</span>
                                    </li>
                                )) : <li className="italic text-gray-400">No rules specified</li>}
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Award className="w-6 h-6 text-green-600" /> Eligibility
                            </h2>
                            <ul className="space-y-3 bg-green-50/50 p-6 rounded-3xl border border-green-100">
                                {event.eligibility?.length > 0 ? event.eligibility.map((item, idx) => (
                                    <li key={idx} className="flex gap-3">
                                        <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-green-500" />
                                        <span>{item}</span>
                                    </li>
                                )) : <li className="italic text-gray-400">No eligibility criteria set</li>}
                            </ul>
                        </section>
                    </div>

                    {/* Schedule */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="w-6 h-6 text-amber-600" /> Schedule
                        </h2>
                        <div className="space-y-4">
                            {event.schedule?.length > 0 ? event.schedule.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-6 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <div className="min-w-[100px] text-purple-600 font-bold text-lg">{item.time}</div>
                                    <div className="h-10 w-[2px] bg-purple-100 rounded-full" />
                                    <div className="text-gray-700 font-semibold">{item.activity}</div>
                                </div>
                            )) : <div className="text-gray-400 italic bg-white p-4 rounded-2xl border border-dashed border-gray-300">Schedule not yet announced</div>}
                        </div>
                    </section>
                </div>

                {/* Right Column - Sidebar Info */}
                <div className="space-y-8">
                    {/* Key Details Card */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl space-y-6">
                        <h3 className="text-xl font-bold text-gray-800">Key Details</h3>

                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-purple-50 rounded-xl">
                                    <Ticket className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Registration Fee</p>
                                    <p className="text-lg font-black text-gray-800">
                                        {event.registrationFee === 0 ? "FREE" : `₹${event.registrationFee}`}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-blue-50 rounded-xl">
                                    <Users className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Capacity</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {event.maxParticipants ? `${event.currentParticipants || 0}/${event.maxParticipants} slots` : "Unlimited slots"}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">Participation: {event.participationType}</p>
                                    {event.participationType === 'Team' && (
                                        <p className="text-xs text-blue-500 font-bold mt-1">Team Size: {event.minTeamSize}-{event.maxTeamSize}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-teal-50 rounded-xl">
                                    <Award className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Prize Pool</p>
                                    <p className="text-lg font-black text-teal-600">
                                        {event.prizeMoney ? `₹${event.prizeMoney}` : "N/A"}
                                    </p>
                                    {event.hasCertificate && (
                                        <p className="text-[10px] bg-teal-100 text-teal-700 font-black px-2 py-0.5 rounded-full mt-1 inline-block">CERTIFICATE INCLUDED</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-gray-100 space-y-4">
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-2 text-center">Registration Timeline</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-gray-500">Starts</span>
                                        <span className="text-gray-800">{formatDate(event.registrationStart)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium">
                                        <span className="text-gray-500">Ends</span>
                                        <span className="text-red-500">{formatDate(event.registrationEnd)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Register button in sidebar for mobile convenience */}
                        {!isPreview && (
                            <div className="pt-2">
                                {getRegisterButton()}
                            </div>
                        )}
                    </div>

                    {/* Coordinators Card */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" /> Contact Organizers
                        </h3>
                        <div className="space-y-6">
                            {event.coordinators?.map((coordinator, idx) => (
                                <div key={idx} className="flex items-center gap-4 group">
                                    <div className="relative">
                                        <img
                                            src={coordinator.profilePic || `https://ui-avatars.com/api/?name=${coordinator.fullName}&background=random`}
                                            alt={coordinator.fullName}
                                            className="w-12 h-12 rounded-full ring-2 ring-purple-100 group-hover:ring-purple-400 transition-all"
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 group-hover:text-purple-600 transition-colors">{coordinator.fullName}</p>
                                        <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
                                            <Mail className="w-3 h-3" /> {coordinator.email}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EventDetails;

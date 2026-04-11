import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Ticket,
    Award,
    Shield,
    Clock,
    Info,
    User,
    Mail,
    CheckCircle,
    XCircle,
    Loader2,
    AlertTriangle,
    Sticker,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSuperAdminStore } from '../../store/superAdmin.store';
import toast from 'react-hot-toast';

const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
};

export const SuperAdminEventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentEvent, fetchEventById, verifyEvent, loading } = useSuperAdminStore();

    const [showRejectBox, setShowRejectBox] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [acting, setActing] = useState(false);

    useEffect(() => {
        fetchEventById(id);
    }, [id]);

    const handleApprove = async () => {
        setActing(true);
        const toastId = toast.loading('Approving event...');
        try {
            await verifyEvent(id, true, null);
            toast.success('Event approved and published!', { id: toastId });
            setShowRejectBox(false);
        } catch {
            toast.error('Approval failed.', { id: toastId });
        } finally {
            setActing(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection.');
            return;
        }
        setActing(true);
        const toastId = toast.loading('Rejecting event...');
        try {
            await verifyEvent(id, false, rejectionReason.trim());
            toast.success('Event rejected.', { id: toastId });
            setShowRejectBox(false);
            setRejectionReason('');
        } catch {
            toast.error('Rejection failed.', { id: toastId });
        } finally {
            setActing(false);
        }
    };

    if (loading && !currentEvent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-full">
                <div className="loading loading-bars loading-xl text-purple-600" />
                <p className="mt-4 text-2xl font-mangodolly text-gray-500 font-bold animate-pulse">
                    Loading event details...
                </p>
            </div>
        );
    }

    if (!currentEvent) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-full text-center">
                <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
                    <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Info className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 font-mangodolly">Event Not Found</h2>
                    <p className="text-gray-500 mb-8">This event doesn't exist or couldn't be loaded.</p>
                    <Link to="/super-admin/events" className="btn btn-lg bg-purple-600 text-white border-none w-full">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Events
                    </Link>
                </div>
            </div>
        );
    }

    const event = currentEvent;
    const isVerified = event.isVerified;
    const isRejected = !!event.rejectionReason && !isVerified;
    const isPending = !event.isDraft && !isVerified && !isRejected;

    return (
        <div className="min-h-screen pt-4 pb-16 w-full">
            {/* Back nav */}
            <div className="max-w-6xl mx-auto mb-4">
                <Link to="/super-admin/events" className="flex items-center gap-1.5 text-gray-400 hover:text-purple-600 text-sm font-bold transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Event List
                </Link>
            </div>

            {/* Status bar */}
            <div className={`sticky top-16 z-40 px-4 py-3 shadow-md flex items-center justify-between rounded-xl mb-4 max-w-6xl mx-auto
                ${isVerified ? 'bg-emerald-50 border border-emerald-200' :
                    isRejected ? 'bg-red-50 border border-red-200' :
                        'bg-amber-50 border border-amber-200'}`}
            >
                <div className="flex items-center gap-2 font-bold text-lg">
                    {isVerified && <><CheckCircle className="w-5 h-5 text-emerald-600" /><span className="text-emerald-700">Approved — This event is live.</span></>}
                    {isRejected && <><XCircle className="w-5 h-5 text-red-600" /><span className="text-red-700">Rejected — {event.rejectionReason}</span></>}
                    {isPending && <><Clock className="w-5 h-5 text-amber-600" /><span className="text-amber-700">Pending Review — Awaiting your decision.</span></>}
                    {event.isDraft && <><Info className="w-5 h-5 text-purple-600" /><span className="text-purple-700">Draft — Not yet submitted by coordinator.</span></>}
                </div>
                {/* Only show action buttons for non-draft events */}
                {!event.isDraft && (
                    <div className="flex gap-2">
                        {!isVerified && (
                            <button
                                onClick={handleApprove}
                                disabled={acting}
                                className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 border-none text-white font-black shadow shadow-emerald-200"
                            >
                                {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CheckCircle className="w-4 h-4" /> Approve</>}
                            </button>
                        )}
                        {isVerified && (
                            <button
                                onClick={() => setShowRejectBox(!showRejectBox)}
                                className="btn btn-sm bg-red-500 hover:bg-red-600 border-none text-white font-black shadow shadow-red-200"
                            >
                                <XCircle className="w-4 h-4" /> Revoke
                            </button>
                        )}
                        {!isVerified && (
                            <button
                                onClick={() => setShowRejectBox(!showRejectBox)}
                                className="btn btn-sm bg-red-500 hover:bg-red-600 border-none text-white font-black shadow shadow-red-200"
                            >
                                <XCircle className="w-4 h-4" /> {isRejected ? 'Re-Reject' : 'Reject'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Rejection textarea */}
            {showRejectBox && (
                <div className="max-w-6xl mx-auto bg-red-50 border border-red-200 rounded-xl p-5 mb-4 animate-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 text-red-700 font-bold mb-3">
                        <AlertTriangle className="w-5 h-5" /> Reason for Rejection
                    </div>
                    <textarea
                        className="textarea textarea-bordered w-full rounded-xl focus:border-red-500 min-h-[100px] text-gray-800 font-medium"
                        placeholder="Explain why this event is rejected. The coordinator will see this message."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => { setShowRejectBox(false); setRejectionReason(''); }}
                            className="btn btn-ghost text-gray-500 font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={acting}
                            className="btn bg-red-600 hover:bg-red-700 border-none text-white px-8 rounded-xl font-black"
                        >
                            {acting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Rejection'}
                        </button>
                    </div>
                </div>
            )}

            {/* Banner */}
            <div className="relative h-[35vh] md:h-[60vh] w-full overflow-hidden">
                {event.bannerImage ? (
                    <img src={event.bannerImage} alt={event.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center p-6">
                        <h1 className="text-4xl md:text-6xl font-black text-white text-center max-w-4xl drop-shadow-2xl">{event.title}</h1>
                    </div>
                )}
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
                            <h1 className="text-3xl font-mangodolly text-white drop-shadow-lg mb-2">{event.title}</h1>
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
                    </div>
                </div>
            </div>

            {/* Body */}
            <main className="max-w-6xl mx-auto font-mangodolly mt-12 grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Left */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Sticker className="w-8 h-8 text-purple-600" /> About Event
                        </h2>
                        <div className="prose prose-purple font-semibold text-lg font-sans max-w-none text-gray-600 leading-relaxed bg-white p-4 border border-gray-100 shadow-sm rounded-xl">
                            {event.description || <span className="italic text-gray-300">No description provided.</span>}
                        </div>
                    </section>

                    <div className="grid md:grid-cols-2 gap-8 text-gray-600">
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Shield className="w-8 h-8 text-blue-600" /> Rules
                            </h2>
                            <ul className="space-y-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                {event.rules?.length > 0
                                    ? [...event.rules].reverse().map((rule, idx) => (
                                        <li key={idx} className="flex gap-3 font-semibold text-lg font-sans">
                                            <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-blue-500" />
                                            <span>{rule}</span>
                                        </li>
                                    ))
                                    : <li className="italic font-semibold text-lg font-sans text-gray-400">No rules specified</li>}
                            </ul>
                        </section>
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Award className="w-8 h-8 text-green-600" /> Eligibility
                            </h2>
                            <ul className="space-y-3 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                {event.eligibility?.length > 0
                                    ? [...event.eligibility].reverse().map((item, idx) => (
                                        <li key={idx} className="flex gap-3 font-semibold text-lg font-sans">
                                            <div className="mt-1.5 min-w-[6px] h-[6px] rounded-full bg-green-500" />
                                            <span>{item}</span>
                                        </li>
                                    ))
                                    : <li className="italic font-semibold text-lg font-sans text-gray-400">No criteria set</li>}
                            </ul>
                        </section>
                    </div>

                    <section>
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock className="w-8 h-8 text-amber-600" /> Schedule
                        </h2>
                        <div className="space-y-4 font-semibold text-lg font-sans">
                            {event.schedule?.length > 0
                                ? [...event.schedule].reverse().map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                                        <div className="min-w-[100px] text-purple-600 font-bold text-lg">{item.time}</div>
                                        <div className="h-10 w-[2px] bg-purple-100 rounded-full" />
                                        <div className="text-gray-700 font-semibold">{item.activity}</div>
                                    </div>
                                ))
                                : <div className="text-gray-400 italic font-semibold text-lg font-sans bg-white p-4 rounded-xl border border-dashed border-gray-300">Schedule not announced</div>}
                        </div>
                    </section>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-lg space-y-5">
                        <h3 className="text-xl font-bold text-gray-800">Key Details</h3>
                        <div className="space-y-5">
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-purple-50 rounded-md"><Ticket className="w-5 h-5 text-purple-600" /></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Registration Fee</p>
                                    <p className="text-lg font-black text-gray-800">{event.registrationFee === 0 ? 'FREE' : `₹${event.registrationFee}`}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-blue-50 rounded-md"><Users className="w-5 h-5 text-blue-600" /></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Capacity</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {event.maxParticipants ? `${event.currentParticipants || 0}/${event.maxParticipants} slots` : 'Unlimited'}
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">Type: {event.participationType}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 bg-teal-50 rounded-md"><Award className="w-5 h-5 text-teal-600" /></div>
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Prize Pool</p>
                                    <p className="text-lg font-black text-teal-600">{event.prizeMoney ? `₹${event.prizeMoney}` : 'N/A'}</p>
                                    {event.hasCertificate && (
                                        <p className="text-sm bg-teal-100 text-teal-700 font-black p-2 rounded mt-1 inline-block">CERTIFICATE INCLUDED</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t-4 border-gray-200 space-y-3">
                            <p className="text-lg text-gray-900 font-bold uppercase tracking-wider">Registration Timeline</p>
                            <div className="flex flex-col text-xs font-medium">
                                <span className="text-gray-500">Starts</span>
                                <span className="text-black text-sm bg-green-100 p-3 rounded">{formatDate(event.registrationStart)}</span>
                            </div>
                            <div className="flex flex-col text-xs font-medium">
                                <span className="text-gray-500">Ends</span>
                                <span className="text-black text-sm p-3 bg-red-100 rounded">{formatDate(event.registrationEnd)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Coordinators */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-lg">
                        <h3 className="text-lg font-bold text-gray-800 mb-5 flex items-center gap-2">
                            <User className="w-6 h-6 text-purple-600" /> Coordinators
                        </h3>
                        <div className="space-y-5 font-sans">
                            {event.coordinators?.map((coordinator, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <img
                                        src={coordinator.profilePic || `https://ui-avatars.com/api/?name=${coordinator.fullName}&background=random`}
                                        alt={coordinator.fullName}
                                        className="w-12 h-12 rounded-full ring-2 ring-purple-100"
                                    />
                                    <div>
                                        <p className="font-bold text-gray-800">{coordinator.fullName}</p>
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

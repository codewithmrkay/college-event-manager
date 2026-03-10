import React, { useState, useEffect } from 'react';
import { ClipboardList, Loader2, Eye, LayoutDashboard, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminEventStore } from '../../../store/adminEvent.store';
import { Link, useNavigate } from 'react-router-dom';

const EventCreationCard = ({ draftEventId, completedSteps = {}, currentEvent = null }) => {
    const [submitting, setSubmitting] = useState(false);
    const { submitEvent, resetCurrentEvent } = useAdminEventStore();
    const navigate = useNavigate();

    const handleReset = () => {
        if (window.confirm('Are you sure you want to reset? All unsaved progress for this draft will be lost from the current session.')) {
            resetCurrentEvent();
            // Clear current draft's session storage if it exists
            if (draftEventId) {
                sessionStorage.removeItem(`savedSteps_${draftEventId}`);
            }
            toast.success('Event reset initiated');

            // Give a tiny delay for the toast/state and then reload
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    };

    const calculateCompletion = () => {
        const steps = ['basic', 'category', 'participation', 'dates', 'capacity', 'media', 'rules', 'submission'];
        const completedCount = steps.filter(step => completedSteps[step]).length;

        if (completedCount === 0) return 0;
        return Math.round((completedCount / steps.length) * 100);
    };

    const completionPercentage = calculateCompletion();
    const isComplete = completionPercentage === 100;

    const handleSubmitForVerification = async () => {
        if (!isComplete) {
            toast.error('Please complete all required sections first to submit');
            return;
        }

        setSubmitting(true);
        const id = toast.loading('Submitting event for verification...');
        try {
            await submitEvent(draftEventId);
            toast.success('Event submitted for verification!', { id });
            navigate('/admin/events');
        } catch (error) {
            toast.error(error.message || 'Error submitting event', { id });
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusText = () => {
        if (currentEvent) {
            if (currentEvent.isDraft) return "Draft Created";
            if (currentEvent.rejectionReason) return "Rejected";
            if (currentEvent.isVerified) return "Live";
            return "Pending Approval";
        }
        return draftEventId ? "Draft Created" : "Not Started";
    };

    const isDraftStatus = currentEvent ? currentEvent.isDraft : true;

    return (
        <div className="font-sans card bg-white shadow-xl border border-gray-200 rounded-2xl p-6 w-full mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <div className="p-2 bg-purple-100 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-16 h-16 text-purple-600" strokeWidth={2.5} />
                </div>
                <div>
                    <p className="text-gray-400 text-md font-bold uppercase tracking-wide">
                        Draft Progress
                    </p>
                    <h2 className="text-4xl font-bold text-gray-800">
                        {completionPercentage}%
                    </h2>
                </div>
            </div>

            {/* Status Info */}
            <div className="space-y-3 mb-6">
                <div className="flex items-start gap-2">
                    <div className={`w-1 h-14 rounded-full ${isComplete ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <div>
                        <p className="text-gray-400 text-md font-bold uppercase">Status</p>
                        <p className="text-gray-800 text-lg font-bold tracking-wide">
                            {getStatusText()}
                        </p>
                    </div>
                </div>

                {!isComplete && draftEventId && isDraftStatus && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded mt-2">
                        <p className="text-amber-800 text-sm font-medium">
                            Complete remaining sections to submit
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
                {isDraftStatus && (
                    <button
                        onClick={handleSubmitForVerification}
                        disabled={!isComplete || submitting || !draftEventId}
                        className={`btn btn-lg w-full text-white border-none ${isComplete && draftEventId
                            ? 'bg-linear-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                            : 'bg-gray-300 cursor-not-allowed'
                            }`}
                    >
                        {submitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                        ) : (
                            'Submit Event'
                        )}
                    </button>
                )}

                {/* Preview and Draft Buttons */}
                <div className="flex flex-col gap-3 pt-2">
                    <div className="flex gap-2">
                        <Link
                            to={`/admin/events/${draftEventId}?preview=true`}
                            target="_blank"
                            className={`btn btn-lg flex-1 whitespace-nowrap border-2 ${draftEventId
                                ? 'bg-white border-blue-500 text-blue-500 hover:bg-blue-50'
                                : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed pointer-events-none'
                                }`}
                        >
                            <Eye className="w-5 h-5 " />
                            Preview Details
                        </Link>

                        <button
                            onClick={handleReset}
                            className={`btn btn-lg flex-1 border-2 ${draftEventId
                                ? 'bg-white border-red-500 text-red-500 hover:bg-red-50'
                                : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            <RefreshCcw className="w-5 h-5" />
                            Reset
                        </button>
                    </div>

                    <Link
                        to="/admin/events"
                        className="btn btn-lg w-full bg-gray-50 border-2 border-gray-200 text-gray-600 hover:bg-gray-100"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Go to Drafts
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default EventCreationCard;

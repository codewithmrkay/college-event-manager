import React, { useState, useEffect } from 'react';
import BasicInfo from '../../components/admin/create-event/BasicInfo';
import CategoryInfo from '../../components/admin/create-event/CategoryInfo';
import ParticipationInfo from '../../components/admin/create-event/ParticipationInfo';
import DatesInfo from '../../components/admin/create-event/DatesInfo';
import CapacityInfo from '../../components/admin/create-event/CapacityInfo';
import MediaInfo from '../../components/admin/create-event/MediaInfo';
import RulesInfo from '../../components/admin/create-event/RulesInfo';
import SubmissionInfo from '../../components/admin/create-event/SubmissionInfo';
import EventCreationCard from '../../components/admin/create-event/EventCreationCard';
import { useAdminEventStore } from '../../store/adminEvent.store';

export const CreateEvent = () => {
    const { currentEvent } = useAdminEventStore();
    const [draftEventId, setDraftEventId] = useState(null);

    // Track steps explicitly saved in sessionStorage (scoped to draft ID)
    // This survives Zustand store updates and page reloads for the same draft
    const getSessionSavedSteps = (eventId) => {
        if (!eventId) return new Set();
        try {
            const stored = sessionStorage.getItem(`savedSteps_${eventId}`);
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch { return new Set(); }
    };

    const [completedSteps, setCompletedSteps] = useState({
        basic: false,
        category: false,
        participation: false,
        dates: false,
        capacity: false,
        media: false,
        rules: false,
        submission: false
    });

    const handleStepSaved = (step) => {
        // Persist to sessionStorage so the flag survives store re-renders
        const key = `savedSteps_${draftEventId}`;
        const existing = getSessionSavedSteps(draftEventId);
        existing.add(step);
        try { sessionStorage.setItem(key, JSON.stringify([...existing])); } catch { /* ignore */ }
        setCompletedSteps(prev => ({ ...prev, [step]: true }));
    };

    // Synchronize completed steps with currentEvent data
    useEffect(() => {
        if (currentEvent) {
            const sessionSaved = getSessionSavedSteps(currentEvent._id);
            setCompletedSteps({
                basic: !!currentEvent.title?.trim() && !!currentEvent.description?.trim(),
                category: !!currentEvent.category && !!currentEvent.eventType,
                participation: !!currentEvent.participationType,
                dates: !!currentEvent.venue?.trim(),
                capacity: currentEvent.maxParticipants !== undefined && currentEvent.maxParticipants !== null,
                media: !!currentEvent.bannerImage,
                // `rules` & `submission` have DB-level defaults (gender='All', requiresMusic/Pdf=false),
                // so field presence alone is not a reliable "was this step saved?" indicator.
                // Fix: check sessionStorage for an explicit save flag FIRST, then fall back to
                // meaningful non-default data (non-empty arrays or a toggled-true boolean).
                rules: sessionSaved.has('rules')
                    || (currentEvent.rules?.length > 0)
                    || (currentEvent.eligibility?.length > 0)
                    || (currentEvent.schedule?.length > 0),
                submission: sessionSaved.has('submission')
                    || currentEvent.requiresMusic === true
                    || currentEvent.requiresPdf === true,
            });
            if (currentEvent._id) setDraftEventId(currentEvent._id);
        } else {
            // Reset triggered
            if (draftEventId) {
                sessionStorage.removeItem(`savedSteps_${draftEventId}`);
            }
            setDraftEventId(null);
            setCompletedSteps({
                basic: false,
                category: false,
                participation: false,
                dates: false,
                capacity: false,
                media: false,
                rules: false,
                submission: false
            });
        }
    }, [currentEvent]);

    return (
        <div className='flex flex-col lg:flex-row w-full min-h-screen items-start py-4 bg-base-300 gap-6'>
            {/* Sticky Sidebar / Tracking Card */}
            <div className='w-full lg:w-1/2 lg:sticky top-0 z-5 h-fit lg:h-screen flex items-center justify-center'>
                <EventCreationCard draftEventId={draftEventId} completedSteps={completedSteps} />
            </div>

            {/* Scrollable Form Chunks */}
            <div className='w-full h-fit my-auto gap-2 flex flex-col items-center justify-center'>
                <h2 className="text-3xl font-mangodolly font-bold text-gray-800 ">Create New Event</h2>
                <BasicInfo
                    draftEventId={draftEventId}
                    isCompleted={completedSteps.basic}
                    onSaved={(id) => {
                        setDraftEventId(id);
                        handleStepSaved('basic');
                    }}
                />

                <CategoryInfo draftEventId={draftEventId} isCompleted={completedSteps.category} onSaved={handleStepSaved} />
                <ParticipationInfo draftEventId={draftEventId} isCompleted={completedSteps.participation} onSaved={handleStepSaved} />
                <DatesInfo draftEventId={draftEventId} isCompleted={completedSteps.dates} onSaved={handleStepSaved} />
                <CapacityInfo draftEventId={draftEventId} isCompleted={completedSteps.capacity} onSaved={handleStepSaved} />
                <MediaInfo draftEventId={draftEventId} isCompleted={completedSteps.media} onSaved={handleStepSaved} />
                <RulesInfo draftEventId={draftEventId} isCompleted={completedSteps.rules} onSaved={handleStepSaved} />
                <SubmissionInfo draftEventId={draftEventId} isCompleted={completedSteps.submission} onSaved={handleStepSaved} />
            </div>
        </div>
    );
};

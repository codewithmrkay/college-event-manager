import React, { useState } from 'react';
import BasicInfo from '../../components/admin/create-event/BasicInfo';
import CategoryInfo from '../../components/admin/create-event/CategoryInfo';
import ParticipationInfo from '../../components/admin/create-event/ParticipationInfo';
import DatesInfo from '../../components/admin/create-event/DatesInfo';
import CapacityInfo from '../../components/admin/create-event/CapacityInfo';
import MediaInfo from '../../components/admin/create-event/MediaInfo';
import RulesInfo from '../../components/admin/create-event/RulesInfo';
import EventCreationCard from '../../components/admin/create-event/EventCreationCard';
import { useAdminEventStore } from '../../store/adminEvent.store';

export const CreateEvent = () => {
    const [draftEventId, setDraftEventId] = useState(null);
    const [completedSteps, setCompletedSteps] = useState({
        basic: false,
        category: false,
        participation: false,
        dates: false,
        capacity: false,
        media: false,
        rules: false
    });

    const handleStepSaved = (step) => {
        setCompletedSteps(prev => ({ ...prev, [step]: true }));
    };

    return (
        <div className='flex flex-col lg:flex-row w-full min-h-screen items-start py-4 bg-base-300 gap-6'>
            {/* Sticky Sidebar / Tracking Card */}
            <div className='w-full lg:w-1/2 lg:sticky top-0 z-5 h-fit lg:h-screen flex items-center justify-center'>
                <EventCreationCard draftEventId={draftEventId} completedSteps={completedSteps} />
            </div>

            {/* Scrollable Form Chunks */}
            <div className='w-full h-fit my-auto gap-2 flex flex-col items-center justify-center'>         
                       <h2 className="text-3xl font-bold text-gray-800 ">Create New Event</h2>
                <BasicInfo
                    draftEventId={draftEventId}
                    onSaved={(id) => {
                        setDraftEventId(id);
                        handleStepSaved('basic');
                    }}
                />

                <CategoryInfo draftEventId={draftEventId} onSaved={handleStepSaved} />
                <ParticipationInfo draftEventId={draftEventId} onSaved={handleStepSaved} />
                <DatesInfo draftEventId={draftEventId} onSaved={handleStepSaved} />
                <CapacityInfo draftEventId={draftEventId} onSaved={handleStepSaved} />
                <MediaInfo draftEventId={draftEventId} onSaved={handleStepSaved} />
                <RulesInfo draftEventId={draftEventId} onSaved={handleStepSaved} />
            </div>
        </div>
    );
};

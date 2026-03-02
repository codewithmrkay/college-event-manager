import React, { useState } from 'react';
import { Calendar, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAdminEventStore } from '../../../store/adminEvent.store';
import { useEffect } from 'react';

const DatesInfo = ({ draftEventId, onSaved }) => {
    const { updateEventDates, currentEvent } = useAdminEventStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        registrationStart: '',
        registrationEnd: '',
        eventStartDate: '',
        eventEndDate: '',
        venue: '',
        isOnline: false
    });

    // Load existing data
    useEffect(() => {
        if (draftEventId && currentEvent && currentEvent._id === draftEventId) {
            setFormData({
                registrationStart: currentEvent.registrationStart ? new Date(currentEvent.registrationStart).toISOString().slice(0, 16) : '',
                registrationEnd: currentEvent.registrationEnd ? new Date(currentEvent.registrationEnd).toISOString().slice(0, 16) : '',
                eventStartDate: currentEvent.eventStartDate ? new Date(currentEvent.eventStartDate).toISOString().slice(0, 16) : '',
                eventEndDate: currentEvent.eventEndDate ? new Date(currentEvent.eventEndDate).toISOString().slice(0, 16) : '',
                venue: currentEvent.venue || '',
                isOnline: currentEvent.isOnline || false
            });
            if (currentEvent.venue) {
                setIsSaved(true);
            }
        }
    }, [draftEventId, currentEvent]);

    const handleSave = async () => {
        if (!formData.venue) {
            toast.error('Venue is required');
            return;
        }

        setSaving(true);
        const id = toast.loading('Saving dates...');
        try {
            await updateEventDates(draftEventId, formData);
            setIsSaved(true);
            setIsOpen(false);
            onSaved?.('dates');
            toast.success('Dates saved!', { id });
        } catch (error) {
            toast.error('Failed to save', { id });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!draftEventId) return null;

    return (
        <div className="shadow-xl collapse collapse-arrow bg-base-100 border border-gray-200 rounded-lg">
            <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
            />

            <div className="collapse-title flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSaved ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}>
                    {isSaved ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <Calendar className="w-5 h-5 text-white" />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Dates & Venue</h3>
                    <p className="text-sm text-gray-500">When and where will it happen?</p>
                </div>
            </div>

            <div className="collapse-content">
                <div className="flex flex-col gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium text-base">Venue *</span></label>
                        <input
                            type="text"
                            className="input font-semibold input-lg w-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                            placeholder="Main Auditorium"
                            value={formData.venue}
                            onChange={e => handleChange('venue', e.target.value)}
                        />
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium text-base">Location Type</span></label>
                        <div className="flex flex-wrap gap-4">
                            {[
                                { label: 'Offline / On-Campus', value: false },
                                { label: 'Online / Virtual', value: true }
                            ].map((opt) => (
                                <label key={opt.label} className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lg hover:border-blue-500 transition-colors ${formData.isOnline === opt.value ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-lg"
                                        checked={formData.isOnline === opt.value}
                                        onChange={() => handleChange('isOnline', opt.value)}
                                    />
                                    <span className="text-lg font-medium">{opt.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium text-base">Registration Start</span></label>
                            <input
                                type="datetime-local"
                                className="input font-semibold input-lg w-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                value={formData.registrationStart}
                                onChange={e => handleChange('registrationStart', e.target.value)}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium text-base">Registration End</span></label>
                            <input
                                type="datetime-local"
                                className="input font-semibold input-lg w-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                                value={formData.registrationEnd}
                                onChange={e => handleChange('registrationEnd', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium text-base">Event Start Date</span></label>
                        <input
                            type="datetime-local"
                            className="input font-semibold input-lg w-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                            value={formData.eventStartDate}
                            onChange={e => handleChange('eventStartDate', e.target.value)}
                        />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium text-base">Event End Date</span></label>
                        <input
                            type="datetime-local"
                            className="input font-semibold input-lg w-full border-2 border-gray-200 focus:border-blue-500 focus:outline-none"
                            value={formData.eventEndDate}
                            onChange={e => handleChange('eventEndDate', e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end mt-2">
                        <button onClick={handleSave} disabled={saving} className="btn btn-md bg-blue-500 hover:bg-blue-600 text-white">
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save & Continue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default DatesInfo;

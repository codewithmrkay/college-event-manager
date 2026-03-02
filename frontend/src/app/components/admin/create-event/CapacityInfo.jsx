import React, { useState } from 'react';
import { Users, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

import { useAdminEventStore } from '../../../store/adminEvent.store';
import { useEffect } from 'react';

const CapacityInfo = ({ draftEventId, onSaved }) => {
    const { updateEventCapacity, currentEvent } = useAdminEventStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        maxParticipants: 100,
        registrationFee: 0,
        hasCertificate: true,
        isRegistrationOpen: false
    });

    // Load existing data
    useEffect(() => {
        if (draftEventId && currentEvent && currentEvent._id === draftEventId) {
            setFormData({
                maxParticipants: currentEvent.maxParticipants || 0,
                registrationFee: currentEvent.registrationFee || 0,
                hasCertificate: currentEvent.hasCertificate !== undefined ? currentEvent.hasCertificate : true,
                isRegistrationOpen: currentEvent.isRegistrationOpen !== undefined ? currentEvent.isRegistrationOpen : false
            });
            if (currentEvent.maxParticipants !== undefined) {
                setIsSaved(true);
            }
        }
    }, [draftEventId, currentEvent]);

    const handleSave = async () => {
        setSaving(true);
        const id = toast.loading('Saving capacity and fees...');
        try {
            await updateEventCapacity(draftEventId, formData);
            setIsSaved(true);
            setIsOpen(false);
            onSaved?.('capacity');
            toast.success('Capacity saved!', { id });
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
                    {isSaved ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <Users className="w-5 h-5 text-white" />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Capacity & Fees</h3>
                    <p className="text-sm text-gray-500">Limits and monetary details</p>
                </div>
            </div>

            <div className="collapse-content">
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium text-base">Max Participants</span></label>
                            <input
                                type="number"
                                className="input font-semibold input-lg w-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                value={formData.maxParticipants}
                                onChange={e => handleChange('maxParticipants', e.target.value)}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-medium text-base">Registration Fee (INR)</span></label>
                            <input
                                type="number"
                                className="input font-semibold input-lg w-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                value={formData.registrationFee}
                                onChange={e => handleChange('registrationFee', e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <div className="form-control">
                            <label className="label cursor-pointer flex justify-between gap-4">
                                <span className="label-text font-medium text-base">Provides Certificate?</span>
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { label: 'Yes', value: true },
                                    { label: 'No', value: false }
                                ].map((opt) => (
                                    <label key={opt.label} className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lg hover:border-blue-500 transition-colors ${formData.hasCertificate === opt.value ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary checkbox-lg"
                                            checked={formData.hasCertificate === opt.value}
                                            onChange={() => handleChange('hasCertificate', opt.value)}
                                        />
                                        <span className="text-lg font-medium">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label cursor-pointer flex justify-between gap-4">
                                <span className="label-text font-medium text-base">Is Registration Open Now?</span>
                            </label>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { label: 'Yes', value: true },
                                    { label: 'No', value: false }
                                ].map((opt) => (
                                    <label key={opt.label} className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lg hover:border-blue-500 transition-colors ${formData.isRegistrationOpen === opt.value ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary checkbox-lg"
                                            checked={formData.isRegistrationOpen === opt.value}
                                            onChange={() => handleChange('isRegistrationOpen', opt.value)}
                                        />
                                        <span className="text-lg font-medium">{opt.label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
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
export default CapacityInfo;

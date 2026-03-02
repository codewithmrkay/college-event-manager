import React, { useState } from 'react';
import { Users, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminEventStore } from '../../../store/adminEvent.store';
import { useEffect } from 'react';

const ParticipationInfo = ({ draftEventId, onSaved }) => {
    const { updateEventParticipation, currentEvent } = useAdminEventStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        participationType: 'Solo',
        minTeamSize: '',
        maxTeamSize: ''
    });

    // Load existing data
    useEffect(() => {
        if (draftEventId && currentEvent && currentEvent._id === draftEventId) {
            setFormData({
                participationType: currentEvent.participationType || 'Solo',
                minTeamSize: currentEvent.minTeamSize || '',
                maxTeamSize: currentEvent.maxTeamSize || ''
            });
            if (currentEvent.participationType) {
                setIsSaved(true);
            }
        }
    }, [draftEventId, currentEvent]);

    const handleSave = async () => {
        if (!formData.participationType) {
            toast.error('Participation Type is required');
            return;
        }

        const payload = { participationType: formData.participationType };
        if (formData.participationType !== 'Solo') {
            payload.minTeamSize = parseInt(formData.minTeamSize) || 1;
            payload.maxTeamSize = parseInt(formData.maxTeamSize) || payload.minTeamSize;
        } else {
            // Fix: Explicitly send nulls when switching back to Solo
            payload.minTeamSize = null;
            payload.maxTeamSize = null;
        }

        setSaving(true);
        const id = toast.loading('Saving participation info...');
        try {
            await updateEventParticipation(draftEventId, payload);
            setIsSaved(true);
            setIsOpen(false);
            onSaved?.('participation');
            toast.success('Participation info saved!', { id });
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
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSaved ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    {isSaved ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <Users className="w-5 h-5 text-white" />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Participation Type</h3>
                    <p className="text-sm text-gray-500">Solo, Team, or Both</p>
                </div>
            </div>

            <div className="collapse-content">
                <div className="flex flex-col gap-4">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium text-base">Participation Format</span></label>
                        <div className="flex flex-wrap gap-4">
                            {['Solo', 'Team', 'Both'].map((type) => (
                                <label key={type} className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lg hover:border-blue-500 transition-colors ${formData.participationType === type ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-lg"
                                        checked={formData.participationType === type}
                                        onChange={() => handleChange('participationType', type)}
                                    />
                                    <span className="text-lg font-medium">{type}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {formData.participationType !== 'Solo' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium text-base">Min Team Size</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    className="input font-semibold input-lg w-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                    value={formData.minTeamSize}
                                    onChange={e => handleChange('minTeamSize', e.target.value)}
                                    placeholder="e.g. 2"
                                />
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text font-medium text-base">Max Team Size</span></label>
                                <input
                                    type="number"
                                    min="1"
                                    className="input font-semibold input-lg w-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                    value={formData.maxTeamSize}
                                    onChange={e => handleChange('maxTeamSize', e.target.value)}
                                    placeholder="e.g. 5"
                                />
                            </div>
                        </div>
                    )}

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
export default ParticipationInfo;

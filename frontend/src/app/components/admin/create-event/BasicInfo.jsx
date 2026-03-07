import React, { useState } from 'react';
import { Check, Edit3, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminEventStore } from '../../../store/adminEvent.store';
import { useEffect } from 'react';

const BasicInfo = ({ draftEventId, onSaved, isCompleted }) => {
    const { createBasicEvent, updateEventBasicInfo, currentEvent } = useAdminEventStore();

    const [formData, setFormData] = useState({
        title: '',
        description: ''
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    // Open if no draft event ID yet
    const [isOpen, setIsOpen] = useState(!draftEventId);

    // Load existing data if draftEventId changes or currentEvent is available
    useEffect(() => {
        if (draftEventId && currentEvent && currentEvent._id === draftEventId) {
            setFormData({
                title: currentEvent.title || '',
                description: currentEvent.description || ''
            });
        }
    }, [draftEventId, currentEvent]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error('Please fill all required fields');
            return;
        }

        setSaving(true);
        const saveToast = toast.loading('Saving basic info...');

        try {
            if (!draftEventId) {
                // Create initial draft
                const data = await createBasicEvent(formData);
                if (data && data.eventId) {
                    onSaved(data.eventId);
                    toast.success('Draft event created!', { id: saveToast });
                    setIsOpen(false);
                } else {
                    toast.error('Failed to create event draft.', { id: saveToast });
                }
            } else {
                // Update existing draft basic info
                await updateEventBasicInfo(draftEventId, formData);
                toast.success('Basic info updated!', { id: saveToast });
                setIsOpen(false);
                onSaved('basic'); // Ensure parent knows it's saved/updated
            }
        } catch (err) {
            toast.error(err.message || 'Failed to save basic info', { id: saveToast });
        } finally {
            setSaving(false);
        }
    };

    const showCheck = isCompleted || (draftEventId !== null && !isOpen);

    return (
        <div className="shadow-xl collapse collapse-arrow bg-base-100 border border-gray-200 rounded-lg">
            <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
            />

            {/* Header */}
            <div className="collapse-title flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showCheck ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}>
                    {showCheck ? (
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    ) : (
                        <Edit3 className="w-5 h-5 text-white" />
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Basic Details</h3>
                    <p className="text-sm text-gray-500">Title, description, and core info</p>
                </div>
            </div>

            {/* Content */}
            <div className="collapse-content">
                <div className="flex flex-col gap-4">
                    {/* Title */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Event Title *</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g. Annual Tech Symposium 2026"
                            value={formData.title}
                            onChange={(e) => handleChange('title', e.target.value)}
                            className={`input font-semibold input-lg w-full border-2 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                } focus:border-blue-500 focus:outline-none`}
                            disabled={saving}
                        />
                        {errors.title && (
                            <span className="text-red-500 text-xs mt-1">{errors.title}</span>
                        )}
                    </div>

                    {/* Description */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Description *</span>
                        </label>
                        <textarea
                            placeholder="Describe what the event is about..."
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            className={`textarea font-semibold textarea-lg w-full border-2 ${errors.description ? 'border-red-500' : 'border-gray-300'
                                } focus:border-blue-500 focus:outline-none h-32`}
                            disabled={saving}
                        />
                        {errors.description && (
                            <span className="text-red-500 text-xs mt-1">{errors.description}</span>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end mt-2">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-md bg-blue-500 hover:bg-blue-600 text-white border-none"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save & Continue'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfo;

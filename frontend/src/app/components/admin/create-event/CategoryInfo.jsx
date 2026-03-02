import React, { useState } from 'react';
import { Tag, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminEventStore } from '../../../store/adminEvent.store';

const CategoryInfo = ({ draftEventId, onSaved }) => {
    // Only open if we have a draft event but haven't saved this section
    const [isOpen, setIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);
    const { updateEventCategory } = useAdminEventStore();

    const [formData, setFormData] = useState({
        category: '',
        eventType: ''
    });

    const handleSave = async () => {
        if (!formData.category || !formData.eventType) {
            toast.error('Both fields are required');
            return;
        }

        setSaving(true);
        const id = toast.loading('Saving category info...');
        try {
            await updateEventCategory(draftEventId, formData);
            setIsSaved(true);
            setIsOpen(false);
            onSaved?.('category');
            toast.success('Category info saved!', { id });
        } catch (error) {
            toast.error('Failed to save', { id });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (!draftEventId) return null; // Hide until basic info is created

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
                    {isSaved ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <Tag className="w-5 h-5 text-white" />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Category & Type</h3>
                    <p className="text-sm text-gray-500">Classification and participation style</p>
                </div>
            </div>

            <div className="collapse-content">
                <div className="flex flex-col gap-4">

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium text-base">Category</span></label>
                        <div className="flex flex-wrap gap-4">
                            {['Technical', 'Cultural', 'Sports', 'Academic', 'Social', 'Other'].map(cat => (
                                <label key={cat} className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lg hover:border-blue-500 transition-colors ${formData.category === cat ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-lg"
                                        checked={formData.category === cat}
                                        onChange={() => handleChange('category', cat)}
                                    />
                                    <span className="text-lg font-medium">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium text-base">Event Type</span></label>
                        <div className="flex flex-wrap gap-4">
                            {['Competition', 'Workshop', 'Seminar', 'Festival', 'Conference', 'Exhibition', 'Other'].map(et => (
                                <label key={et} className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lg hover:border-blue-500 transition-colors ${formData.eventType === et ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-lg"
                                        checked={formData.eventType === et}
                                        onChange={() => handleChange('eventType', et)}
                                    />
                                    <span className="text-lg font-medium">{et}</span>
                                </label>
                            ))}
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
export default CategoryInfo;

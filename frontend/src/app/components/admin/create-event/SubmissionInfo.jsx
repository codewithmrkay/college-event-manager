import React, { useState, useEffect } from 'react';
import { FileText, Check, Loader2, Music, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminEventStore } from '../../../store/adminEvent.store';

const SubmissionInfo = ({ draftEventId, onSaved, isCompleted }) => {
    const { updateEventRules, currentEvent } = useAdminEventStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        requiresMusic: false,
        requiresPdf: false
    });

    // Load existing data
    useEffect(() => {
        if (draftEventId && currentEvent && currentEvent._id === draftEventId) {
            setFormData({
                requiresMusic: !!currentEvent.requiresMusic,
                requiresPdf: !!currentEvent.requiresPdf
            });
        }
    }, [draftEventId, currentEvent]);

    const handleSave = async () => {
        setSaving(true);
        const id = toast.loading('Saving submission requirements...');
        try {
            await updateEventRules(draftEventId, formData);
            setIsSaved(true);
            setIsOpen(false);
            onSaved?.('submission');
            toast.success('Requirements saved!', { id });
        } catch (error) {
            toast.error('Failed to save', { id });
        } finally {
            setSaving(false);
        }
    };

    const toggleField = (field) => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const showCheck = isCompleted || isSaved;

    if (!draftEventId) return null;

    return (
        <div className="shadow-xl collapse collapse-arrow bg-base-100 border border-gray-200 rounded-lg w-full max-w-4xl">
            <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
            />

            <div className="collapse-title flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${showCheck ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    {showCheck ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <FileUp className="w-5 h-5 text-white" />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Submission Requirements</h3>
                    <p className="text-sm text-gray-500">Configure what files students need to upload</p>
                </div>
            </div>

            <div className="collapse-content">
                <div className="flex flex-col gap-6 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Music Requirement Card */}
                        <label
                            className={`flex flex-col gap-3 cursor-pointer p-6 border-2 rounded-xl transition-all hover:shadow-md ${formData.requiresMusic
                                ? 'border-blue-500 bg-blue-50/30'
                                : 'border-gray-200 bg-white'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-lg ${formData.requiresMusic ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <Music className="w-6 h-6" />
                                </div>
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary checkbox-lg"
                                    checked={formData.requiresMusic}
                                    onChange={() => toggleField('requiresMusic')}
                                />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold">Music/MP3 File</h4>
                                <p className="text-sm text-gray-500">Enable this if participants need to upload an audio track for their performance.</p>
                            </div>
                        </label>

                        {/* PDF Requirement Card */}
                        <label
                            className={`flex flex-col gap-3 cursor-pointer p-6 border-2 rounded-xl transition-all hover:shadow-md ${formData.requiresPdf
                                ? 'border-blue-500 bg-blue-50/30'
                                : 'border-gray-200 bg-white'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-lg ${formData.requiresPdf ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary checkbox-lg"
                                    checked={formData.requiresPdf}
                                    onChange={() => toggleField('requiresPdf')}
                                />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold">PDF Document</h4>
                                <p className="text-sm text-gray-500">Enable this if participants need to submit reports, abstracts, or identity proofs in PDF format.</p>
                            </div>
                        </label>
                    </div>

                    <div className="flex justify-end mt-4 border-t pt-4">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-md bg-blue-500 hover:bg-blue-600 text-white border-none px-8 rounded-lg shadow-lg shadow-blue-200"
                        >
                            {saving ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                            ) : (
                                'Save Submission Info'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubmissionInfo;

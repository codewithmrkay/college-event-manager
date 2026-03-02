import React, { useEffect, useState } from 'react';
import { BookOpen, Check, Loader2, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminEventStore } from '../../../store/adminEvent.store';

const RulesInfo = ({ draftEventId, onSaved }) => {
    const { updateEventRules, currentEvent } = useAdminEventStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        gender: 'All',
        rules: [],
        eligibility: []
    });

    const [newRule, setNewRule] = useState('');
    const [newEligibility, setNewEligibility] = useState('');

    // Load existing data
    useEffect(() => {
        if (draftEventId && currentEvent && currentEvent._id === draftEventId) {
            setFormData({
                gender: currentEvent.gender || 'All',
                rules: currentEvent.rules || [],
                eligibility: currentEvent.eligibility || []
            });
            if (currentEvent.gender) {
                setIsSaved(true);
            }
        }
    }, [draftEventId, currentEvent]);

    const handleSave = async () => {
        setSaving(true);
        const id = toast.loading('Saving rules & details...');
        try {
            await updateEventRules(draftEventId, {
                gender: formData.gender,
                rules: formData.rules,
                eligibility: formData.eligibility
            });
            setIsSaved(true);
            setIsOpen(false);
            onSaved?.('rules');
            toast.success('Rules info saved!', { id });
        } catch (error) {
            toast.error('Failed to save', { id });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addArrayItem = (field, value, setInput) => {
        if (!value.trim()) return;
        setFormData(prev => ({ ...prev, [field]: [value, ...prev[field]] }));
        setInput('');
    };

    const removeArrayItem = (field, index) => {
        const newArr = [...formData[field]];
        newArr.splice(index, 1);
        setFormData(prev => ({ ...prev, [field]: newArr }));
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
                    {isSaved ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <BookOpen className="w-5 h-5 text-white" />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Rules & Details</h3>
                    <p className="text-sm text-gray-500">Gender criteria, eligibility, and instructions</p>
                </div>
            </div>

            <div className="collapse-content">
                <div className="flex flex-col gap-5">
                    <div className="form-control">
                        <label className="label"><span className="label-text font-medium text-base">Allowed Gender</span></label>
                        <div className="flex flex-wrap gap-4">
                            {['All', 'Male', 'Female'].map((gen) => (
                                <label key={gen} className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lg hover:border-blue-500 transition-colors ${formData.gender === gen ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200'
                                    }`}>
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary checkbox-lg"
                                        checked={formData.gender === gen}
                                        onChange={() => handleChange('gender', gen)}
                                    />
                                    <span className="text-lg font-medium">{gen}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Eligibility Criteria</span>
                        </label>
                        <div className="flex flex-col gap-3">
                            {/* New Item Input at Top */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="input font-semibold input-lg w-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                    value={newEligibility}
                                    onChange={(e) => setNewEligibility(e.target.value)}
                                    placeholder="Add new criteria (e.g. Only 3rd year students)"
                                    onKeyDown={(e) => e.key === 'Enter' && addArrayItem('eligibility', newEligibility, setNewEligibility)}
                                />
                                <button
                                    onClick={() => addArrayItem('eligibility', newEligibility, setNewEligibility)}
                                    className="btn btn-lg bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
                                >
                                    <Plus className="w-5 h-5" /> Add
                                </button>
                            </div>

                            {/* List of existing items */}
                            <div className="flex flex-col gap-2 mt-2">
                                {formData.eligibility.map((item, index) => (
                                    <div key={`el-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg group">
                                        <span className="flex-1 font-medium text-gray-700">{item}</span>
                                        <button
                                            onClick={() => removeArrayItem('eligibility', index)}
                                            className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Rules & Instructions</span>
                        </label>
                        <div className="flex flex-col gap-3">
                            {/* New Rule Input at Top */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    className="input font-semibold input-lg w-full border-2 border-gray-300 focus:border-blue-500 focus:outline-none"
                                    value={newRule}
                                    onChange={(e) => setNewRule(e.target.value)}
                                    placeholder="Add new rule (e.g. Carry college ID cards)"
                                    onKeyDown={(e) => e.key === 'Enter' && addArrayItem('rules', newRule, setNewRule)}
                                />
                                <button
                                    onClick={() => addArrayItem('rules', newRule, setNewRule)}
                                    className="btn btn-lg bg-blue-500 hover:bg-blue-600 text-white border-none px-6"
                                >
                                    <Plus className="w-5 h-5" /> Add
                                </button>
                            </div>

                            {/* List of existing rules */}
                            <div className="flex flex-col gap-2 mt-2">
                                {formData.rules.map((rule, index) => (
                                    <div key={`ru-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg group">
                                        <span className="flex-1 font-medium text-gray-700">{rule}</span>
                                        <button
                                            onClick={() => removeArrayItem('rules', index)}
                                            className="btn btn-sm btn-ghost text-red-500 hover:bg-red-50 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-2">
                        <button onClick={handleSave} disabled={saving} className="btn btn-md bg-blue-500 hover:bg-blue-600 text-white">
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save & Finish'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default RulesInfo;

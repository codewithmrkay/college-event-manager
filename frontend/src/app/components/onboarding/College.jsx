import { useState, useEffect } from 'react';
import { Check, GraduationCap, Loader2 } from 'lucide-react';
import { useUserStore } from '../../store/user.store';
import toast from 'react-hot-toast';

const College = () => {
    const [formData, setFormData] = useState({
        department: '',
        class: '',
        rollNo: ''
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    const { user, updateCollegeInfo } = useUserStore();

    const departments = ['BCS', 'BCA', 'BBA', 'BCOM', 'BSC'];
    const classes = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

    // Load existing data and set accordion state
    useEffect(() => {
        if (user?.department && user?.class && user?.rollNo) {
            setFormData({
                department: user.department || '',
                class: user.class || '',
                rollNo: user.rollNo || ''
            });
            setIsOpen(false); // Close if already saved
        }
    }, [user?.department, user?.class, user?.rollNo]);

    const isSaved = user?.department && user?.class && user?.rollNo;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.department) {
            newErrors.department = 'Please select a department';
        }

        if (!formData.class) {
            newErrors.class = 'Please select a class';
        }

        if (!formData.rollNo.trim()) {
            newErrors.rollNo = 'Roll number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error('Please fill all required fields');
            return;
        }

        setSaving(true);
        const saveToast = toast.loading('Saving college information...');

        try {
            const result = await updateCollegeInfo({
                department: formData.department,
                class: formData.class,
                rollNo: formData.rollNo.trim()
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to save');
            }

            toast.success('College information saved successfully!', { id: saveToast });
            setIsOpen(false); // Close accordion after save

        } catch (err) {
            toast.error(err.message || 'Failed to save', { id: saveToast });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="shadow-xl collapse collapse-arrow bg-base-100 border border-gray-200 rounded-lg">
            <input 
                type="checkbox" 
                checked={isOpen} 
                onChange={(e) => setIsOpen(e.target.checked)}
            />

            {/* Header */}
            <div className="collapse-title flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isSaved ? 'bg-emerald-500' : 'bg-gray-300'
                }`}>
                    {isSaved ? (
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    ) : (
                        <GraduationCap className="w-5 h-5 text-white" />
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">College Information</h3>
                    <p className="text-sm text-gray-500">Your academic details</p>
                </div>
            </div>

            {/* Content */}
            <div className="collapse-content">
                <div className="flex flex-col gap-4">

                    {/* Department */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Department *</span>
                        </label>
                        <div className="flex flex-col gap-3">
                            {departments.map((dept) => (
                                <label 
                                    key={dept}
                                    className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lg hover:border-blue-500 transition-colors ${
                                        errors.department ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.department === dept}
                                        onChange={() => handleChange('department', dept)}
                                        className="checkbox checkbox-primary checkbox-lg"
                                        disabled={saving}
                                    />
                                    <span className="text-lg font-medium">{dept}</span>
                                </label>
                            ))}
                        </div>
                        {errors.department && (
                            <span className="text-red-500 text-xs mt-1">{errors.department}</span>
                        )}
                    </div>

                    {/* Class */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Class/Year *</span>
                        </label>
                        <div className="flex flex-col gap-3">
                            {classes.map((cls) => (
                                <label 
                                    key={cls}
                                    className={`flex items-center gap-3 cursor-pointer p-4 border-2 rounded-lg hover:border-blue-500 transition-colors ${
                                        errors.class ? 'border-red-500' : 'border-gray-200'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.class === cls}
                                        onChange={() => handleChange('class', cls)}
                                        className="checkbox checkbox-primary checkbox-lg"
                                        disabled={saving}
                                    />
                                    <span className="text-lg font-medium">{cls}</span>
                                </label>
                            ))}
                        </div>
                        {errors.class && (
                            <span className="text-red-500 text-xs mt-1">{errors.class}</span>
                        )}
                    </div>

                    {/* Roll Number */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Roll Number *</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your roll number"
                            value={formData.rollNo}
                            onChange={(e) => handleChange('rollNo', e.target.value)}
                            className={`input input-lg w-full border-2 ${
                                errors.rollNo ? 'border-red-500' : 'border-gray-300'
                            } focus:border-blue-500 focus:outline-none`}
                            disabled={saving}
                        />
                        {errors.rollNo && (
                            <span className="text-red-500 text-xs mt-1">{errors.rollNo}</span>
                        )}
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
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
                                'Save'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default College;
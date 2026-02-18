import { useState, useEffect } from 'react';
import { Check, User, Loader2 } from 'lucide-react';
import { useUserStore } from '../../store/user.store';
import toast from 'react-hot-toast';

const About = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        gender: ''
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    const { user, updateAboutInfo } = useUserStore();

    // Load existing data and set accordion state
    useEffect(() => {
        if (user?.fullName && user?.gender) {
            const names = user.fullName.split(' ');
            setFormData({
                firstName: names[0] || '',
                middleName: names[1] || '',
                lastName: names[2] || '',
                gender: user.gender || ''
            });
            setIsOpen(false); // Close if already saved
        }
    }, [user?.fullName, user?.gender]);

    const isSaved = user?.fullName && user?.gender;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.firstName.trim()) {
            newErrors.firstName = 'First name is required';
        }

        if (!formData.middleName.trim()) {
            newErrors.middleName = 'Middle name is required';
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Last name is required';
        }

        if (!formData.gender) {
            newErrors.gender = 'Please select gender';
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
        const saveToast = toast.loading('Saving your information...');

        try {
            // Combine names
            const fullName = [
                formData.firstName.trim(),
                formData.middleName.trim(),
                formData.lastName.trim()
            ]
                .filter(Boolean)
                .join(' ');

            const result = await updateAboutInfo({
                fullName,
                gender: formData.gender
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to save');
            }

            toast.success('Information saved successfully!', { id: saveToast });
            setIsOpen(false); // Close accordion after save

        } catch (err) {
            toast.error(err.message || 'Failed to save', { id: saveToast });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="collapse collapse-arrow bg-base-100 border border-gray-200 rounded-lg">
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
                        <User className="w-5 h-5 text-white" />
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">About You</h3>
                    <p className="text-sm text-gray-500">Your personal information</p>
                </div>
            </div>

            {/* Content */}
            <div className="collapse-content">
                <div className="flex flex-col gap-4">

                    {/* First Name */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">First Name *</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            className={`input font-semibold input-lg w-full border-2 ${
                                errors.firstName ? 'border-red-500' : 'border-gray-300'
                            } focus:border-blue-500 focus:outline-none`}
                            disabled={saving}
                        />
                        {errors.firstName && (
                            <span className="text-red-500 text-xs mt-1">{errors.firstName}</span>
                        )}
                    </div>

                    {/* Middle Name */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Middle Name *</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your middle name"
                            value={formData.middleName}
                            onChange={(e) => handleChange('middleName', e.target.value)}
                             className={`input font-semibold input-lg w-full border-2 ${
                                errors.middleName ? 'border-red-500' : 'border-gray-300'
                            } focus:border-blue-500 focus:outline-none`}
                            disabled={saving}
                        />
                        {errors.middleName && (
                            <span className="text-red-500 text-xs mt-1">{errors.middleName}</span>
                        )}
                    </div>

                    {/* Last Name */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Last Name *</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            className={`input font-semibold input-lg w-full  border-2 ${
                                errors.lastName ? 'border-red-500' : 'border-gray-300'
                            } focus:border-blue-500 focus:outline-none`}
                            disabled={saving}
                        />
                        {errors.lastName && (
                            <span className="text-red-500 text-xs mt-1">{errors.lastName}</span>
                        )}
                    </div>

                    {/* Gender */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Gender *</span>
                        </label>
                        <div className="flex flex-col gap-3">
                            {/* Male */}
                            <label className={`flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:border-primary transition-colors ${
                                errors.gender ? 'border-red-500' : 'border-gray-200'
                            }`}>
                                <input
                                    type="checkbox"
                                    checked={formData.gender === 'Male'}
                                    onChange={() => handleChange('gender', 'Male')}
                                    className="checkbox checkbox-primary checkbox-lg"
                                    disabled={saving}
                                />
                                <span className="text-lg font-medium">Male</span>
                            </label>

                            {/* Female */}
                            <label className={`flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:border-primary transition-colors ${
                                errors.gender ? 'border-red-500' : 'border-gray-200'
                            }`}>
                                <input
                                    type="checkbox"
                                    checked={formData.gender === 'Female'}
                                    onChange={() => handleChange('gender', 'Female')}
                                    className="checkbox checkbox-primary checkbox-lg"
                                    disabled={saving}
                                />
                                <span className="text-lg font-medium">Female</span>
                            </label>

                            {/* Other */}
                            <label className={`flex items-center gap-3 cursor-pointer p-4 border rounded-lg hover:border-primary transition-colors ${
                                errors.gender ? 'border-red-500' : 'border-gray-200'
                            }`}>
                                <input
                                    type="checkbox"
                                    checked={formData.gender === 'Other'}
                                    onChange={() => handleChange('gender', 'Other')}
                                    className="checkbox checkbox-primary checkbox-lg"
                                    disabled={saving}
                                />
                                <span className="text-lg font-medium">Other</span>
                            </label>
                        </div>
                        {errors.gender && (
                            <span className="text-red-500 text-xs mt-1">{errors.gender}</span>
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

export default About;
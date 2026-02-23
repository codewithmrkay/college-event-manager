import { useState, useEffect } from 'react';
import { Check, Phone, Loader2, Linkedin, Github, Instagram, LinkedinIcon } from 'lucide-react';
import { useUserStore } from '../../store/user.store';
import toast from 'react-hot-toast';
import ReactCountryFlag from "react-country-flag";
import "flag-icons/css/flag-icons.min.css";
const ContactDetails = () => {
    const [formData, setFormData] = useState({
        phoneNumber: '',
        linkedin: '',
        github: '',
        instagram: ''
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    const { user, updateContactDetails } = useUserStore();

    // Load existing data and set accordion state
    useEffect(() => {
        if (user?.phoneNumber) {
            setFormData({
                phoneNumber: user.phoneNumber || '',
                linkedin: user.links?.linkedin || '',
                github: user.links?.github || '',
                instagram: user.links?.instagram || ''
            });
            setIsOpen(false); // Close if already saved
        }
    }, [user?.phoneNumber, user?.links]);

    const isSaved = user?.phoneNumber;

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};

        // Phone number validation
        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else if (!/^[0-9]{10}$/.test(formData.phoneNumber.trim())) {
            newErrors.phoneNumber = 'Phone number must be 10 digits';
        }

        // LinkedIn validation (optional but if provided, must be valid)
        if (formData.linkedin && !formData.linkedin.includes('linkedin.com')) {
            newErrors.linkedin = 'Please enter a valid LinkedIn URL';
        }

        // GitHub validation (optional but if provided, must be valid)
        if (formData.github && !formData.github.includes('github.com')) {
            newErrors.github = 'Please enter a valid GitHub URL';
        }

        // Instagram validation (optional but if provided, must be valid)
        if (formData.instagram && !formData.instagram.includes('instagram.com')) {
            newErrors.instagram = 'Please enter a valid Instagram URL';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) {
            toast.error('Please fix the errors');
            return;
        }

        setSaving(true);
        const saveToast = toast.loading('Saving contact details...');

        try {
            const result = await updateContactDetails({
                phoneNumber: formData.phoneNumber.trim(),
                links: {
                    linkedin: formData.linkedin.trim() || undefined,
                    github: formData.github.trim() || undefined,
                    instagram: formData.instagram.trim() || undefined
                }
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to save');
            }

            toast.success('Contact details saved successfully!', { id: saveToast });
            setIsOpen(false); // Close accordion after save

        } catch (err) {
            toast.error(err.message || 'Failed to save', { id: saveToast });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="collapse shadow-xl collapse-arrow bg-base-100 border border-gray-200 rounded-lg">
            <input
                type="checkbox"
                checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)}
            />

            {/* Header */}
            <div className="collapse-title flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSaved ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}>
                    {isSaved ? (
                        <Check className="w-5 h-5 text-white" strokeWidth={3} />
                    ) : (
                        <Phone className="w-5 h-5 text-white" />
                    )}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Contact Details</h3>
                    <p className="text-sm text-gray-500">Phone and social media links</p>
                </div>
            </div>

            {/* Content */}
            <div className="collapse-content">
                <div className="flex flex-col gap-4">

                    {/* Phone Number with Indian Flag */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Phone Number *</span>
                        </label>
                        <div className="flex items-center gap-2">
                            {/* Indian Flag */}
                            <div className="flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg bg-gray-50">
                                {/* <span className="text-2xl">🇮🇳</span> */}
                                {/* <ReactCountryFlag countryCode="IN" /> */}

                                <span className="fi fi-in"></span>
                                <span className="text-lg font-medium">+91</span>
                            </div>
                            {/* Phone Input */}
                            <input
                                type="tel"
                                placeholder="Enter 10 digit mobile number"
                                value={formData.phoneNumber}
                                onChange={(e) => handleChange('phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 10))}
                                className={`input input-lg w-full border-2 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                    } focus:border-blue-500 focus:outline-none`}
                                disabled={saving}
                                maxLength={10}
                            />
                        </div>
                        {errors.phoneNumber && (
                            <span className="text-red-500 text-xs mt-1">{errors.phoneNumber}</span>
                        )}
                    </div>

                    {/* LinkedIn */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">LinkedIn (Optional)</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-2">
                                <LinkedinIcon className="w-6 h-6 text-blue-600" />
                            </div>
                            <input
                                type="url"
                                placeholder="https://linkedin.com/in/yourprofile"
                                value={formData.linkedin}
                                onChange={(e) => handleChange('linkedin', e.target.value)}
                                className={`input input-lg w-full pl-14 border-2 ${errors.linkedin ? 'border-red-500' : 'border-gray-300'
                                    } focus:border-blue-500 focus:outline-none`}
                                disabled={saving}
                            />
                        </div>
                        {errors.linkedin && (
                            <span className="text-red-500 text-xs mt-1">{errors.linkedin}</span>
                        )}
                    </div>

                    {/* GitHub */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">GitHub (Optional)</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-2">
                                <Github className="w-6 h-6 text-gray-800" />
                            </div>
                            <input
                                type="url"
                                placeholder="https://github.com/yourusername"
                                value={formData.github}
                                onChange={(e) => handleChange('github', e.target.value)}
                                className={`input input-lg w-full pl-14 border-2 ${errors.github ? 'border-red-500' : 'border-gray-300'
                                    } focus:border-blue-500 focus:outline-none`}
                                disabled={saving}
                            />
                        </div>
                        {errors.github && (
                            <span className="text-red-500 text-xs mt-1">{errors.github}</span>
                        )}
                    </div>

                    {/* Instagram */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">Instagram (Optional)</span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-2">
                                <Instagram className="w-6 h-6 text-pink-600" />
                            </div>
                            <input
                                type="url"
                                placeholder="https://instagram.com/yourusername"
                                value={formData.instagram}
                                onChange={(e) => handleChange('instagram', e.target.value)}
                                className={`input input-lg w-full pl-14 border-2 ${errors.instagram ? 'border-red-500' : 'border-gray-300'
                                    } focus:border-blue-500 focus:outline-none`}
                                disabled={saving}
                            />
                        </div>
                        {errors.instagram && (
                            <span className="text-red-500 text-xs mt-1">{errors.instagram}</span>
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

export default ContactDetails;
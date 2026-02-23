import { useState, useEffect } from 'react';
import { Check, Upload, Loader2 } from 'lucide-react';
import { useUserStore } from '../../store/user.store';
import toast from 'react-hot-toast';

const CollegeFee = () => {
    const [preview, setPreview] = useState(null);
    const [cloudinaryUrl, setCloudinaryUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(true); // Open by default

    const { user, getuploadsign, updateCollegeFeeImage } = useUserStore();

    useEffect(() => {
        if (user?.collegeFeeImg) {
            setPreview(user.collegeFeeImg)
            setIsOpen(false);
        };
    }, [user?.collegeFeeImg]);

    const isSaved = user?.collegeFeeImg && !cloudinaryUrl;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');
        setCloudinaryUrl('');

        // Validation
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 2MB');
            toast.error('Image must be less than 2MB');
            return;
        }

        // Check square
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = async () => {
            URL.revokeObjectURL(url);

            // if (img.width !== img.height) {
            //     setError('Image must be square');
            //     toast.error('Image must be square');
            //     return;
            // }

            // Valid - show preview and upload
            setPreview(URL.createObjectURL(file));
            setUploading(true);

            // Show upload toast
            const uploadToast = toast.loading('Uploading image...');

            try {
                // Get signature
                const signData = await getuploadsign({ folder: 'fee-receipts' });

                if (!signData.data.cloudName) {
                    throw new Error('Missing cloud configuration');
                }

                const { signature, timestamp, cloudName, apiKey, folder } = signData.data;

                // Upload to Cloudinary
                const formData = new FormData();
                formData.append('file', file);
                formData.append('signature', signature);
                formData.append('timestamp', timestamp);
                formData.append('api_key', apiKey);
                formData.append('folder', folder);

                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                    { method: 'POST', body: formData }
                );

                if (!res.ok) throw new Error('Upload failed');

                const data = await res.json();
                setCloudinaryUrl(data.secure_url);

                // Success toast
                toast.success('Image uploaded! Click Save to update College Fee Picture', {
                    id: uploadToast,
                    duration: 4000
                });

            } catch (err) {
                setError(err.message || 'Upload failed');
                setPreview(user?.collegeFeeImg || null);
                toast.error(err.message || 'Upload failed', { id: uploadToast });
            } finally {
                setUploading(false);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            setError('Failed to load image');
            toast.error('Failed to load image');
        };

        img.src = url;
    };

    const handleSave = async () => {
        if (!cloudinaryUrl) return;

        setSaving(true);
        setError('');

        const saveToast = toast.loading('Saving Fees picture...');

        try {
            const result = await updateCollegeFeeImage(cloudinaryUrl);
            if (!result.success) throw new Error(result.error || 'Failed to save');

            setCloudinaryUrl('');
            toast.success('Fees picture saved successfully!', { id: saveToast });

        } catch (err) {
            setError(err.message);
            toast.error(err.message || 'Failed to save', { id: saveToast });
        } finally {
            setSaving(false);
        }
    };

    // const handleChangeClick = () => {
    //     toast('Select a new image to change your profile picture', {
    //         icon: '🖼️',
    //         duration: 3000
    //     });
    // };

    return (
        <div className="shadow-xl collapse collapse-arrow bg-base-100 border border-gray-200 rounded-lg">
            <input type="checkbox" checked={isOpen}
                onChange={(e) => setIsOpen(e.target.checked)} />

            <div className="collapse-title flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSaved ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}>
                    {isSaved ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <Upload className="w-5 h-5 text-white" />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">College Fees Picture</h3>
                    <p className="text-sm text-gray-500">max 5MB</p>
                </div>
            </div>

            <div className="collapse-content">
                <div className="space-y-4">

                    <label className="block">
                        <div className={`relative w-64 h-64 mx-auto border-2 border-dashed rounded-lg transition-colors overflow-hidden bg-gray-50 ${uploading || saving
                            ? 'border-gray-300 cursor-not-allowed'
                            : 'border-gray-300 hover:border-primary cursor-pointer'
                            }`}>

                            {preview ? (
                                <img src={preview} alt="college fees img" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Upload className="w-12 h-12 mb-2" />
                                    <p className="text-sm font-medium">Click to upload</p>
                                    <p className="text-xs mt-1">(max 5MB)</p>
                                </div>
                            )}

                            {uploading && (
                                <div className="absolute inset-0 bg-gray-500 bg-opacity-100 flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                                    <p className="text-gray-300 text-md">Uploading...</p>
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            disabled={uploading || saving}
                        />
                    </label>

                    {error && <p className="text-error text-sm text-center">{error}</p>}

                    {cloudinaryUrl && !error && (
                        <p className="text-success text-sm text-center">✓ Uploaded! Click Save</p>
                    )}

                    <div className="flex justify-end gap-2">
                        {isSaved && (
                            <label
                                className="btn btn-md bg-red-500 hover:bg-red-600 text-white border-none cursor-pointer"
                            >
                                Change
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    disabled={uploading || saving}
                                />
                            </label>
                        )}

                        <button
                            onClick={handleSave}
                            disabled={!cloudinaryUrl || saving}
                            className={`btn btn-md ${cloudinaryUrl
                                ? 'bg-blue-500 hover:bg-blue-600 text-white border-none'
                                : 'btn-disabled'
                                }`}
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

export default CollegeFee;
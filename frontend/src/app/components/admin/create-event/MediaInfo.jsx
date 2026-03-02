import React, { useState } from 'react';
import { Image as ImageIcon, Check, Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useUserStore } from '../../../store/user.store';
import { useAdminEventStore } from '../../../store/adminEvent.store';

const MediaInfo = ({ draftEventId, onSaved }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [saving, setSaving] = useState(false);

    const [preview, setPreview] = useState(null);
    const [cloudinaryUrl, setCloudinaryUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const { getuploadsign } = useUserStore();
    const { updateEventMedia } = useAdminEventStore();

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setError('');
        setCloudinaryUrl('');

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = async () => {
            URL.revokeObjectURL(url);

            // Check 16/9 roughly
            const ratio = img.width / img.height;
            if (ratio < 1.7 || ratio > 1.8) {
                toast.error('Warning: Image should ideally be 16:9 for best results.', { duration: 4000 });
            }

            setPreview(URL.createObjectURL(file));
            setUploading(true);
            const uploadToast = toast.loading('Uploading banner image...');

            try {
                const signData = await getuploadsign({ folder: 'events' });

                if (!signData.success || !signData.data || !signData.data.cloudName) {
                    throw new Error(signData.error || 'Missing cloud configuration');
                }

                const { signature, timestamp, cloudName, apiKey, folder } = signData.data;

                const formData = new FormData();
                formData.append('file', file);
                formData.append('signature', signature);
                formData.append('timestamp', timestamp);
                formData.append('api_key', apiKey);
                formData.append('folder', folder);

                const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST', body: formData
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error?.message || 'Upload failed');
                }
                const data = await res.json();

                setCloudinaryUrl(data.secure_url);
                toast.success('Image uploaded! Click Save to continue', { id: uploadToast });
            } catch (err) {
                console.error('Upload Error:', err);
                setError(err.message || 'Upload failed');
                setPreview(null);
                setCloudinaryUrl('');
                toast.error(err.message || 'Upload failed', { id: uploadToast });
            } finally {
                setUploading(false);
            }
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            toast.error('Failed to load image');
        };

        img.src = url;
    };

    const handleSave = async () => {
        setSaving(true);
        const id = toast.loading('Saving media...');
        try {
            await updateEventMedia(draftEventId, { bannerImage: cloudinaryUrl });
            setIsSaved(true);
            setIsOpen(false);
            onSaved?.('media');
            toast.success('Media saved!', { id });
        } catch (error) {
            toast.error('Failed to save', { id });
        } finally {
            setSaving(false);
        }
    };

    if (!draftEventId) return null;

    return (
        <div className="shadow-xl collapse collapse-arrow bg-base-100 border border-gray-200 rounded-lg">
            <input type="checkbox" checked={isOpen} onChange={(e) => setIsOpen(e.target.checked)} />

            <div className="collapse-title flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSaved ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                    {isSaved ? <Check className="w-5 h-5 text-white" strokeWidth={3} /> : <ImageIcon className="w-5 h-5 text-white" />}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">Event Media</h3>
                    <p className="text-sm text-gray-500">Banner image (16:9 ratio)</p>
                </div>
            </div>

            <div className="collapse-content">
                <div className="flex flex-col gap-4">

                    <label className="block w-full">
                        <div className={`relative w-full aspect-video md:w-3/4 lg:w-2/3 mx-auto border-2 border-dashed rounded-lg transition-colors overflow-hidden bg-gray-50 ${uploading || saving ? 'border-gray-300 cursor-not-allowed' : 'border-gray-300 hover:border-primary cursor-pointer'}`}>
                            {preview ? (
                                <img src={preview} alt="Banner" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                    <Upload className="w-12 h-12 mb-2" />
                                    <p className="text-sm font-medium">Click to upload 16:9 banner</p>
                                    <p className="text-xs mt-1">(max 5MB)</p>
                                </div>
                            )}

                            {uploading && (
                                <div className="absolute inset-0 bg-gray-500 bg-opacity-70 flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                                    <p className="text-gray-100 font-medium">Uploading...</p>
                                </div>
                            )}
                        </div>

                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading || saving} />
                    </label>

                    <div className="flex justify-end mt-2">
                        <button onClick={handleSave} disabled={saving || uploading} className="btn btn-md bg-blue-500 hover:bg-blue-600 text-white">
                            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save & Continue'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default MediaInfo;

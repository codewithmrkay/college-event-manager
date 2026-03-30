import { useState, useEffect } from 'react';
import { Check, Upload, Loader2, Hash } from 'lucide-react';
import { useUserStore } from '../../store/user.store';
import toast from 'react-hot-toast';

const CollegeFee = () => {
    const [preview, setPreview] = useState(null);
    const [cloudinaryUrl, setCloudinaryUrl] = useState('');
    const [feeReceiptNo, setFeeReceiptNo] = useState('');
    const [receiptNoError, setReceiptNoError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(true); // Open by default

    const { user, getuploadsign, updateCollegeFeeImage } = useUserStore();

    useEffect(() => {
        if (user?.collegeFeeImg) {
            setPreview(user.collegeFeeImg);
            setFeeReceiptNo(user?.feeReceiptNo || '');
            setIsOpen(false);
        };
    }, [user?.collegeFeeImg, user?.feeReceiptNo]);

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
            setError('Image must be less than 5MB');
            toast.error('Image must be less than 5MB');
            return;
        }

        // Check square
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = async () => {
            URL.revokeObjectURL(url);

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
                toast.success('Image uploaded! Enter receipt number & click Save', {
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

    const handleReceiptNoChange = (value) => {
        setFeeReceiptNo(value.toUpperCase());
        setReceiptNoError('');
    };

    const handleSave = async () => {
        if (!cloudinaryUrl) return;

        // Validate receipt number
        if (!feeReceiptNo.trim()) {
            setReceiptNoError('Fee receipt / cheque number is required');
            toast.error('Please enter the fee receipt / cheque number');
            return;
        }

        setSaving(true);
        setError('');

        const saveToast = toast.loading('Saving fee receipt...');

        try {
            const result = await updateCollegeFeeImage(cloudinaryUrl, feeReceiptNo.trim());
            if (!result.success) throw new Error(result.error || 'Failed to save');

            setCloudinaryUrl('');
            toast.success('Fee receipt saved! Awaiting admin verification.', { id: saveToast });

        } catch (err) {
            setError(err.message);
            toast.error(err.message || 'Failed to save', { id: saveToast });
        } finally {
            setSaving(false);
        }
    };

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
                    <h3 className="text-lg font-semibold">College Fees Receipt</h3>
                    <p className="text-sm text-gray-500">Upload receipt image &amp; enter cheque / DD number</p>
                </div>
            </div>

            <div className="collapse-content">
                <div className="flex flex-col gap-4">

                    {/* Image Upload */}
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
                        <p className="text-success text-sm text-center">✓ Uploaded! Enter receipt number &amp; click Save</p>
                    )}

                    {/* Fee Receipt / Cheque Number Input */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium text-base">
                                Fee Receipt / Cheque No. *
                            </span>
                        </label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                                <Hash className="w-5 h-5 text-blue-500" />
                            </div>
                            <input
                                type="text"
                                placeholder="e.g. CHQ123456 or DD789012"
                                value={feeReceiptNo}
                                onChange={(e) => handleReceiptNoChange(e.target.value)}
                                className={`input input-lg w-full pl-12 border-2 ${receiptNoError ? 'border-red-500' : 'border-gray-300'
                                    } focus:border-blue-500 focus:outline-none tracking-widest uppercase`}
                                disabled={saving || uploading}
                                maxLength={30}
                            />
                        </div>
                        {receiptNoError && (
                            <span className="text-red-500 text-xs mt-1">{receiptNoError}</span>
                        )}
                        {user?.feeReceiptNo && !cloudinaryUrl && (
                            <span className="text-gray-400 text-xs mt-1">
                                Saved: <span className="font-semibold tracking-widest">{user.feeReceiptNo}</span>
                            </span>
                        )}
                    </div>

                    {/* Action Buttons */}
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
import { useState, useEffect } from 'react';
import { ClipboardList, QrCode, Loader2 } from 'lucide-react';
import { useUserStore } from '../../store/user.store';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

const OnboardingCard = () => {
    const [showQR, setShowQR] = useState(false);
    const [completing, setCompleting] = useState(false);
    
    const { user, completeOnboarding } = useUserStore();

    // Calculate completion percentage (5 sections × 20% each)
    const calculateCompletion = () => {
        let percentage = 0;
        
        // 1. Profile Picture (20%)
        if (user?.profilePic) percentage += 20;
        
        // 2. About Info - First, Middle, Last Name + Gender (20%)
        if (user?.fullName && user?.gender) percentage += 20;
        
        // 3. College Info - Department, Class, Roll No (20%)
        if (user?.department && user?.class && user?.rollNo) percentage += 20;
        
        // 4. Contact Details - Phone Number (20%)
        if (user?.phoneNumber) percentage += 20;
        
        // 5. Fee Receipt (20%)
        if (user?.collegeFeeImg) percentage += 20;
        
        return percentage;
    };

    const completionPercentage = calculateCompletion();
    const isComplete = completionPercentage === 100;

    // Generate QR data with all user information
    const generateQRData = () => {
        return JSON.stringify({
            id: user?._id,
            name: user?.fullName,
            email: user?.email,
            gender: user?.gender,
            department: user?.department,
            class: user?.class,
            rollNo: user?.rollNo,
            phone: user?.phoneNumber,
            profilePic: user?.profilePic,
            isVerified: user?.isVerified,
            linkedin: user?.links?.linkedin,
            github: user?.links?.github,
            instagram: user?.links?.instagram,
            timestamp: new Date().toISOString()
        });
    };

    const handleCompleteOnboarding = async () => {
        if (!isComplete) {
            toast.error('Please complete all sections first');
            return;
        }

        setCompleting(true);
        const completingToast = toast.loading('Completing onboarding...');

        try {
            const result = await completeOnboarding();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to complete onboarding');
            }

            toast.success('Onboarding completed! Waiting for admin verification.', { 
                id: completingToast,
                duration: 5000 
            });

        } catch (err) {
            toast.error(err.message || 'Failed to complete onboarding', { id: completingToast });
        } finally {
            setCompleting(false);
        }
    };

    const handleShowQR = () => {
        if (!isComplete) {
            toast.error('Complete your profile to generate QR code');
            return;
        }
        setShowQR(true);
        toast.success('QR Code generated! Save or scan it for attendance.');
    };

    return (
        <>
            {/* Main Card */}
            <div className="font-sans card bg-white shadow-xl border border-gray-200 rounded-2xl p-6 w-fit mx-auto">
                
                {/* Icon and Title */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-2 bg-teal-100 rounded-xl flex items-center justify-center">
                        <ClipboardList className="w-20 h-20 text-teal-600" strokeWidth={2.5} />
                    </div>
                    <div>
                        <p className="text-gray-400 text-lg font-bold uppercase tracking-wide">
                            Profile Completion
                        </p>
                        <h2 className="text-5xl font-mangodolly font-bold text-gray-800">
                            {completionPercentage}%
                        </h2>
                    </div>
                </div>

                {/* Status Info */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-start gap-2">
                        <div className="w-1 h-16 bg-blue-500 rounded-full" />
                        <div>
                            <p className="text-gray-400 text-lg font-bold uppercase">Status</p>
                            <p className="text-gray-800 text-lg font-bold tracking-wide">
                                {user?.isOnboarded 
                                    ? (user?.isVerified ? 'Verified ✓' : 'Pending Verification') 
                                    : 'Not Completed'
                                }
                            </p>
                        </div>
                    </div>

                    {!isComplete && (
                        <div className="bg-amber-50 border-l-4 border-amber-400 p-3 rounded">
                            <p className="text-amber-800 text-sm font-medium">
                                Complete all sections to submit
                            </p>
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    {/* Complete Onboarding Button */}
                    <button
                        onClick={handleCompleteOnboarding}
                        disabled={!isComplete || completing || user?.isOnboarded}
                        className={`btn btn-lg w-full text-white border-none ${
                            isComplete && !user?.isOnboarded
                                ? 'bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                                : 'bg-gray-300 cursor-not-allowed'
                        }`}
                    >
                        {completing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Completing...
                            </>
                        ) : user?.isOnboarded ? (
                            'Onboarding Completed ✓'
                        ) : (
                            'Complete Onboarding'
                        )}
                    </button>

                    {/* Show QR Code Button */}
                    <button
                        onClick={handleShowQR}
                        disabled={!isComplete}
                        className={`btn btn-lg w-full border-2 ${
                            isComplete
                                ? 'bg-white border-blue-500 text-blue-500 hover:bg-blue-50'
                                : 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <QrCode className="w-5 h-5" />
                        Show QR Code
                    </button>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQR && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-md">
                        <h3 className="font-bold text-lg mb-4">Your QR Code</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Scan this QR code for attendance and verification
                        </p>
                        
                        {/* QR Code */}
                        <div className="flex justify-center p-6 bg-white border-2 border-gray-200 rounded-lg">
                            <QRCodeSVG 
                                value={generateQRData()} 
                                size={256}
                                level="H"
                                includeMargin={true}
                            />
                        </div>

                        {/* User Info */}
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
                            <p className="font-semibold">{user?.fullName}</p>
                            <p className="text-gray-600">{user?.rollNo}</p>
                            <p className="text-gray-600">{user?.department} - {user?.class}</p>
                        </div>

                        {/* Close Button */}
                        <div className="modal-action">
                            <button 
                                onClick={() => setShowQR(false)}
                                className="btn btn-md bg-blue-500 text-sans text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <div className="modal-backdrop" onClick={() => setShowQR(false)} />
                </div>
            )}
        </>
    );
};

export default OnboardingCard;
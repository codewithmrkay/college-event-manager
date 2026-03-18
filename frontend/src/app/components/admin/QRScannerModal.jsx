import React, { useEffect, useState, useRef } from 'react';
import { QrCode, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { markAttendance } from '../../services/event.services';

const QRScannerModal = ({ isOpen, onClose, participants, onAttendanceMarked }) => {
    const [scannedParticipant, setScannedParticipant] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const scannerRef = useRef(null);

    useEffect(() => {
        if (isOpen && !scannedParticipant) {
            const startScanner = async () => {
                try {
                    const html5QrCode = new Html5Qrcode("reader");
                    scannerRef.current = html5QrCode;

                    const config = {
                        fps: 15,
                        qrbox: { width: 250, height: 250 },
                        aspectRatio: 1.0,
                    };

                    await html5QrCode.start(
                        { facingMode: "environment" },
                        config,
                        onScanSuccess
                    );
                } catch (err) {
                    console.error("Scanner error:", err);
                    toast.error("Camera access failed");
                }
            };

            const timer = setTimeout(startScanner, 200);
            return () => {
                clearTimeout(timer);
                if (scannerRef.current) {
                    if (scannerRef.current.isScanning) {
                        scannerRef.current.stop().then(() => {
                            scannerRef.current.clear();
                        }).catch(e => console.error(e));
                    }
                }
            };
        }
    }, [isOpen, scannedParticipant]);

    const onScanSuccess = (decodedText) => {
        try {
            const data = JSON.parse(decodedText);
            const studentId = data.id;
            if (!studentId) return;

            const found = participants.find(p => p.student?._id === studentId);
            if (!found) {
                toast.error("Not Registered", { id: 'scan-error' });
                return;
            }

            if (found.status === 'cancelled') {
                toast.error("Cancelled Registration", { id: 'scan-error' });
                return;
            }

            if (scannerRef.current) {
                scannerRef.current.stop().catch(e => console.error(e));
            }

            setScannedParticipant(found);
        } catch (e) {
            // Silence invalid scans
        }
    };

    const handleConfirmAttendance = async () => {
        if (!scannedParticipant) return;
        setIsProcessing(true);
        try {
            await markAttendance(scannedParticipant._id, true);
            toast.success("Attendance Success!");
            onAttendanceMarked(scannedParticipant._id);
            handleClose();
        } catch (error) {
            toast.error('Failed to mark');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClose = () => {
        setScannedParticipant(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col bg-black overflow-hidden font-sans animate-in fade-in duration-300">

            {/* Header / Close Button */}
            <div className="absolute top-0 inset-x-0 z-50 p-6 flex justify-between items-center bg-linear-to-b from-black/60 to-transparent">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                        <QrCode className="w-6 h-6" />
                    </div>
                    <span className="text-white font-bold text-xl tracking-wide font-mangodolly">Scanner</span>
                </div>
                <button
                    onClick={handleClose}
                    className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 hover:bg-white/20 transition-all"
                >
                    <XCircle className="w-7 h-7" />
                </button>
            </div>

            {/* Scanner / Preview Layer */}
            <div className="flex-1 relative">
                {!scannedParticipant ? (
                    <div className="w-full h-full relative">
                        {/* Video Feed */}
                        <div id="reader" className="w-full h-full" />

                        {/* Semi-transparent Overlay */}
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center pointer-events-none">
                            <div className="relative">
                                {/* The Frame */}
                                <div className="w-64 h-64 border-2 border-white/30 rounded-3xl relative">
                                    {/* PhonePe-style active corners */}
                                    <div className="absolute -top-1 -left-1 w-10 h-10 border-t-4 border-l-4 border-blue-500 rounded-tl-xl" />
                                    <div className="absolute -top-1 -right-1 w-10 h-10 border-t-4 border-r-4 border-blue-500 rounded-tr-xl" />
                                    <div className="absolute -bottom-1 -left-1 w-10 h-10 border-b-4 border-l-4 border-blue-500 rounded-bl-xl" />
                                    <div className="absolute -bottom-1 -right-1 w-10 h-10 border-b-4 border-r-4 border-blue-500 rounded-br-xl" />

                                    {/* Moving Line */}
                                    <div className="absolute inset-x-0 h-1 bg-blue-400 shadow-[0_0_15px_#3b82f6] animate-scan-line top-0" />
                                </div>
                            </div>
                            <p className="text-white/60 mt-10 font-bold uppercase tracking-[0.2em] text-[10px]">
                                Scanning QR Code...
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-white flex flex-col animate-in slide-in-from-bottom duration-500 overflow-y-auto">
                        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8">
                            <div className="relative group">
                                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20" />
                                <div className="w-32 h-32 rounded-[2rem] overflow-hidden border-4 border-blue-50 shadow-2xl relative">
                                    <img
                                        src={scannedParticipant.student?.profilePic || `https://ui-avatars.com/api/?name=${scannedParticipant.student?.fullName || 'S'}&background=random`}
                                        className="w-full h-full object-cover"
                                        alt="Student"
                                    />
                                </div>
                            </div>

                            <div className="text-center">
                                <h4 className="text-3xl font-black text-gray-900 font-mangodolly italic tracking-tight">
                                    {scannedParticipant.student?.fullName}
                                </h4>
                                <p className="text-blue-600 font-black text-xl mt-1">{scannedParticipant.student?.rollNo}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                                    <span className="text-[10px] uppercase font-black text-gray-400 mb-1">Department</span>
                                    <span className="font-bold text-gray-800">{scannedParticipant.student?.department}</span>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center">
                                    <span className="text-[10px] uppercase font-black text-gray-400 mb-1">Class</span>
                                    <span className="font-bold text-gray-800">{scannedParticipant.student?.class}</span>
                                </div>
                            </div>

                            <div className="w-full max-w-sm pt-8">
                                {scannedParticipant.attended ? (
                                    <div className="w-full py-5 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center gap-3 font-black text-lg border-2 border-emerald-100">
                                        <CheckCircle className="w-6 h-6" /> ALREADY PRESENT
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleConfirmAttendance}
                                        disabled={isProcessing}
                                        className="w-full py-5 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-100 flex items-center justify-center"
                                    >
                                        {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : "CONFIRM ATTENDANCE"}
                                    </button>
                                )}

                                <button
                                    onClick={() => setScannedParticipant(null)}
                                    className="w-full py-4 text-gray-400 font-black text-sm uppercase tracking-widest mt-4"
                                >
                                    Scan another
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                #reader { background: black !important; }
                #reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; }
                @keyframes scan-line {
                    0% { top: 0; opacity: 0; }
                    5% { opacity: 1; }
                    95% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
                .animate-scan-line {
                    animation: scan-line 2.5s infinite linear;
                }
            `}</style>
        </div>
    );
};

export default QRScannerModal;

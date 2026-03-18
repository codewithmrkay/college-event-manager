import React, { useEffect, useState } from 'react';
import { QrCode, XCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { markAttendance } from '../../services/event.services';

const QRScannerModal = ({ isOpen, onClose, participants, onAttendanceMarked }) => {
    const [scannedParticipant, setScannedParticipant] = useState(null);
    const [scanError, setScanError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        let scanner = null;
        if (isOpen && !scannedParticipant && !scanError) {
            const timer = setTimeout(() => {
                scanner = new Html5QrcodeScanner("reader", {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    showTorchButtonIfSupported: true,
                    videoConstraints: {
                        facingMode: "environment"
                    }
                });

                scanner.render(onScanSuccess, (err) => {
                    // console.log(err);
                });
            }, 100);

            return () => {
                clearTimeout(timer);
                if (scanner) {
                    scanner.clear().catch(error => {
                        console.error("Failed to clear scanner", error);
                    });
                }
            };
        }
    }, [isOpen, scannedParticipant, scanError]);

    const onScanSuccess = (decodedText) => {
        try {
            const data = JSON.parse(decodedText);
            const studentId = data.id;

            if (!studentId) {
                setScanError("Invalid QR: Student ID not found");
                return;
            }

            const found = participants.find(p => p.student?._id === studentId);

            if (!found) {
                setScanError(`Student "${data.name || 'Unknown'}" is not registered for this event`);
                return;
            }

            if (found.status === 'cancelled') {
                setScanError(`Registration for "${found.student.fullName}" has been cancelled`);
                return;
            }

            setScannedParticipant(found);
            toast.success("Student found!");
        } catch (e) {
            setScanError("Invalid QR Code: Format not recognized");
        }
    };

    const handleConfirmAttendance = async () => {
        if (!scannedParticipant) return;

        setIsProcessing(true);
        try {
            await markAttendance(scannedParticipant._id, true);
            toast.success(`Attendance marked for ${scannedParticipant.student.fullName}`);
            onAttendanceMarked(scannedParticipant._id);
            handleClose();
        } catch (error) {
            toast.error('Failed to update attendance');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleReset = () => {
        setScannedParticipant(null);
        setScanError(null);
    };

    const handleClose = () => {
        handleReset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-lg p-0 overflow-hidden bg-white border-2 border-blue-500 rounded-2xl shadow-2xl animate-in zoom-in duration-300">
                {/* Modal Header */}
                <div className="bg-blue-500 p-4 flex justify-between items-center text-white">
                    <h3 className="font-mangodolly text-xl font-bold flex items-center gap-2">
                        <QrCode className="w-6 h-6" /> Attendance Scanner
                    </h3>
                    <button
                        onClick={handleClose}
                        className="btn btn-circle btn-sm btn-ghost hover:bg-blue-600 text-white border-none"
                    >
                        <XCircle className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6">
                    {/* View 1: Scanning Mode */}
                    {!scannedParticipant && !scanError && (
                        <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden border-4 border-dashed border-gray-200 bg-gray-50">
                                <div id="reader" className="w-full"></div>
                                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                    <div className="w-64 h-64 border-2 border-blue-400/50 rounded-lg animate-pulse" />
                                </div>
                            </div>
                            <p className="text-center text-gray-500 font-medium">
                                Position the student's QR code within the frame to scan
                            </p>
                        </div>
                    )}

                    {/* View 2: Success Mode (Student Found) */}
                    {scannedParticipant && (
                        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
                            <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-100 flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                                    <img
                                        src={scannedParticipant.student?.profilePic || `https://ui-avatars.com/api/?name=${scannedParticipant.student?.fullName || 'S'}&background=random`}
                                        className="w-full h-full object-cover"
                                        alt="Student"
                                    />
                                </div>
                                <h4 className="text-2xl font-black text-gray-900 font-mangodolly italic">
                                    {scannedParticipant.student?.fullName}
                                </h4>
                                <p className="text-blue-600 font-bold tracking-wider mt-1">
                                    {scannedParticipant.student?.rollNo}
                                </p>
                                <div className="flex flex-wrap justify-center gap-2 mt-4">
                                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-600 border border-blue-100 uppercase">
                                        {scannedParticipant.student?.department}
                                    </span>
                                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-gray-600 border border-blue-100 uppercase">
                                        {scannedParticipant.student?.class}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {scannedParticipant.attended ? (
                                    <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl flex items-center justify-center gap-3 font-bold border border-emerald-200">
                                        <CheckCircle className="w-6 h-6" /> Already marked present
                                    </div>
                                ) : (
                                    <button
                                        onClick={handleConfirmAttendance}
                                        disabled={isProcessing}
                                        className="btn btn-lg w-full bg-blue-500 hover:bg-blue-600 border-none text-white font-black text-lg shadow-xl shadow-blue-200"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Marking...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-5 h-5" /> Mark Attendance
                                            </>
                                        )}
                                    </button>
                                )}

                                <button
                                    onClick={handleReset}
                                    className="btn btn-lg btn-ghost w-full text-gray-400 font-bold hover:bg-gray-50"
                                >
                                    Scan Another
                                </button>
                            </div>
                        </div>
                    )}

                    {/* View 3: Error Mode (Not Registered/Invalid) */}
                    {scanError && (
                        <div className="space-y-6 animate-in zoom-in duration-300">
                            <div className="bg-red-50 rounded-2xl p-8 border-2 border-red-100 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500">
                                    <XCircle className="w-12 h-12" />
                                </div>
                                <h4 className="text-2xl font-black text-red-600 font-mangodolly uppercase tracking-tight">
                                    Scan Error
                                </h4>
                                <p className="text-gray-700 font-bold mt-4 max-w-xs leading-relaxed">
                                    {scanError}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleReset}
                                    className="btn btn-lg w-full bg-red-500 hover:bg-red-600 border-none text-white font-black text-lg shadow-xl shadow-red-200"
                                >
                                    Try Again / Scan Another
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="btn btn-lg btn-ghost w-full text-gray-400 font-bold hover:bg-gray-50"
                                >
                                    Close Scanner
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <style>{`
                    #reader { border: none !important; padding: 0 !important; }
                    #reader video { 
                        border-radius: 0.75rem !important; 
                        object-fit: cover !important;
                    }
                    #reader__dashboard_section_csr button {
                        background-color: #3b82f6 !important;
                        color: white !important;
                        border: none !important;
                        padding: 8px 16px !important;
                        border-radius: 8px !important;
                        font-weight: 700 !important;
                        cursor: pointer !important;
                        margin: 10px 5px !important;
                        font-family: inherit !important;
                    }
                    #reader__dashboard_section_csr button:hover { background-color: #2563eb !important; }
                    #reader__camera_selection {
                        padding: 8px !important;
                        border-radius: 8px !important;
                        border: 1px solid #e5e7eb !important;
                        outline: none !important;
                        width: 100% !important;
                        margin-top: 10px !important;
                    }
                `}</style>
            </div>
            <div className="modal-backdrop bg-black/60 backdrop-blur-sm" onClick={handleClose} />
        </div>
    );
};

export default QRScannerModal;

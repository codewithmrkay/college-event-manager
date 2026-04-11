import React, { useEffect, useState } from 'react';
import {
    ArrowLeft,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Mail,
    Phone,
    BookOpen,
    Hash,
    ExternalLink,
    ShieldCheck,
    ShieldOff,
    Image as ImageIcon,
    Receipt,
} from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSuperAdminStore } from '../../store/superAdmin.store';
import toast from 'react-hot-toast';

const InfoRow = ({ icon: Icon, label, value, mono = false }) => (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
        <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-gray-400" />
        </div>
        <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
            <p className={`text-gray-800 font-bold text-lg mt-0.5 ${mono ? 'font-mono' : ''}`}>
                {value || <span className="text-gray-300 italic font-normal">—</span>}
            </p>
        </div>
    </div>
);

export const SuperAdminStudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { students, fetchStudents, verifyStudent, loading } = useSuperAdminStore();

    const [student, setStudent] = useState(null);
    const [fetching, setFetching] = useState(true);
    const [confirming, setConfirming] = useState(false); // 'verify' | 'revoke' | false

    // Fetch single student by fetching all and finding — there is no /students/:id endpoint,
    // so we fetch with high limit and find by id. If store already has it, use that.
    useEffect(() => {
        const fromStore = students.find((s) => s._id === id);
        if (fromStore) {
            setStudent(fromStore);
            setFetching(false);
        } else {
            (async () => {
                await fetchStudents({ limit: 100 });
                setFetching(false);
            })();
        }
    }, [id]);

    // Keep student state in sync with store when verification changes
    useEffect(() => {
        const fromStore = students.find((s) => s._id === id);
        if (fromStore) setStudent(fromStore);
    }, [students, id]);

    const handleVerify = async (isVerified) => {
        const toastId = toast.loading(isVerified ? 'Verifying student...' : 'Revoking verification...');
        try {
            await verifyStudent(id, isVerified);
            toast.success(isVerified ? 'Student verified!' : 'Verification revoked.', { id: toastId });
            setConfirming(false);
        } catch {
            toast.error('Action failed. Please try again.', { id: toastId });
        }
    };

    if (fetching) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-full">
                <div className="loading loading-bars loading-xl text-purple-600" />
                <p className="mt-4 text-2xl font-mangodolly text-gray-500 font-bold animate-pulse">
                    Loading student details...
                </p>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen w-full text-center">
                <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full">
                    <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <User className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2 font-mangodolly">Student Not Found</h2>
                    <p className="text-gray-500 mb-8">This student doesn't exist or couldn't be loaded.</p>
                    <Link to="/super-admin/students" className="btn btn-lg bg-purple-600 text-white border-none w-full">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to List
                    </Link>
                </div>
            </div>
        );
    }

    const isVerified = student.isVerified;
    const hasFeeReceipt = !!student.collegeFeeImg;

    const getStatusBanner = () => {
        if (!student.isOnboarded) return { label: 'Not Onboarded', cls: 'bg-gray-100 text-gray-600', Icon: XCircle };
        if (isVerified) return { label: 'Verified', cls: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle2 };
        if (hasFeeReceipt) return { label: 'Pending Review', cls: 'bg-amber-100 text-amber-700', Icon: Clock };
        return { label: 'Unverified', cls: 'bg-red-100 text-red-600', Icon: XCircle };
    };

    const { label, cls, Icon: StatusIcon } = getStatusBanner();

    return (
        <div className="max-w-5xl mx-auto py-10 space-y-8 animate-in fade-in duration-500 w-full">
            {/* Back */}
            <Link to="/super-admin/students" className="flex items-center gap-1.5 text-gray-400 hover:text-purple-600 text-sm font-bold transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Student List
            </Link>

            {/* Top Card */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-7 flex flex-col md:flex-row gap-7 items-center">
                <img
                    src={student.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName || '?')}&background=8b5cf6&color=fff&size=128`}
                    alt={student.fullName}
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-purple-100 flex-shrink-0"
                />
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-3xl font-mangodolly font-black text-gray-900">{student.fullName || '(No Name)'}</h1>
                    <p className="text-gray-500 font-medium text-xl">{student.email}</p>
                    <div className="flex items-center gap-2 justify-center md:justify-start mt-3">
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-black uppercase tracking-wider ${cls}`}>
                            <StatusIcon className="w-4 h-4" /> {label}
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                {student.isOnboarded && (
                    <div className="flex flex-col gap-3 flex-shrink-0">
                        {!isVerified ? (
                            confirming === 'verify' ? (
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-bold text-gray-600 text-center">Confirm verification?</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setConfirming(false)} className="btn btn-sm btn-ghost border border-gray-200">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleVerify(true)}
                                            disabled={loading}
                                            className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 border-none text-white font-black"
                                        >
                                            {loading ? <span className="loading loading-spinner loading-xs" /> : <><ShieldCheck className="w-4 h-4" /> Yes, Verify</>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirming('verify')}
                                    className="btn btn-lg bg-emerald-500 hover:bg-emerald-600 border-none text-white font-black shadow-lg shadow-emerald-200"
                                >
                                    <ShieldCheck className="w-5 h-5 mr-1" /> Verify Student
                                </button>
                            )
                        ) : (
                            confirming === 'revoke' ? (
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-bold text-gray-600 text-center">Revoke verification?</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => setConfirming(false)} className="btn btn-sm btn-ghost border border-gray-200">
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleVerify(false)}
                                            disabled={loading}
                                            className="btn btn-sm bg-red-500 hover:bg-red-600 border-none text-white font-black"
                                        >
                                            {loading ? <span className="loading loading-spinner loading-xs" /> : <><ShieldOff className="w-4 h-4" /> Revoke</>}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setConfirming('revoke')}
                                    className="btn btn-lg bg-red-500 hover:bg-red-600 border-none text-white font-black shadow-lg shadow-red-200"
                                >
                                    <ShieldOff className="w-5 h-5 mr-1" /> Revoke Verification
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: Info */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                        <h2 className="text-xl font-black text-gray-800 mb-2">Student Info</h2>
                        <InfoRow icon={Mail} label="Email" value={student.email} />
                        <InfoRow icon={Phone} label="Phone" value={student.phoneNumber} />
                        <InfoRow icon={BookOpen} label="Department" value={student.department} />
                        <InfoRow icon={BookOpen} label="Class / Year" value={student.class} />
                        <InfoRow icon={Hash} label="Roll Number" value={student.rollNo} mono />
                        <InfoRow icon={Receipt} label="Fee Receipt No." value={student.feeReceiptNo} mono />
                    </div>

                    {/* Links */}
                    {(student.links?.linkedin || student.links?.github || student.links?.portfolio) && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <h2 className="text-xl font-black text-gray-800 mb-3">Links</h2>
                            <div className="space-y-3">
                                {student.links?.linkedin && (
                                    <a href={student.links.linkedin} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-blue-600 hover:underline font-semibold">
                                        <ExternalLink className="w-4 h-4" /> LinkedIn
                                    </a>
                                )}
                                {student.links?.github && (
                                    <a href={student.links.github} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-gray-700 hover:underline font-semibold">
                                        <ExternalLink className="w-4 h-4" /> GitHub
                                    </a>
                                )}
                                {student.links?.portfolio && (
                                    <a href={student.links.portfolio} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-purple-600 hover:underline font-semibold">
                                        <ExternalLink className="w-4 h-4" /> Portfolio
                                    </a>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Fee Receipt *key verification item* */}
                <div className="lg:col-span-3">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 h-full">
                        <h2 className="text-xl font-black text-gray-800 mb-1 flex items-center gap-2">
                            <Receipt className="w-6 h-6 text-amber-500" /> College Fee Receipt
                        </h2>
                        <p className="text-gray-400 font-medium text-sm mb-5">
                            Cross-check the receipt image and reference number before verifying.
                        </p>

                        {hasFeeReceipt ? (
                            <div className="space-y-4">
                                <div className="rounded-xl overflow-hidden border border-gray-100 shadow-inner bg-gray-50">
                                    <img
                                        src={student.collegeFeeImg}
                                        alt="Fee Receipt"
                                        className="w-full object-contain max-h-[400px]"
                                    />
                                </div>
                                <a
                                    href={student.collegeFeeImg}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm btn-ghost border border-gray-200 font-bold gap-2"
                                >
                                    <ExternalLink className="w-4 h-4" /> Open Full Image
                                </a>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
                                <p className="text-gray-400 font-bold text-lg">No fee receipt uploaded</p>
                                <p className="text-gray-300 text-sm mt-1">Student hasn't submitted their receipt yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

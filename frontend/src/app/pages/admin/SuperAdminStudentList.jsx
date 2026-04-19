import React, { useEffect, useState } from 'react';
import {
    Search,
    Eye,
    CheckCircle2,
    XCircle,
    Clock,
    Users,
    ArrowLeft,
    ArrowRight,
    ShieldCheck,
    ShieldOff,
    Filter,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useSuperAdminStore } from '../../store/superAdmin.store';

const FILTERS = ['all', 'pending', 'verified', 'not-onboarded'];

const filterLabels = {
    all: 'All',
    pending: 'Pending Review',
    verified: 'Verified',
    'not-onboarded': 'Not Onboarded',
};

const filterToParam = {
    all: {},
    pending: { verified: 'pending' },
    verified: { verified: 'true' },
    'not-onboarded': { isOnboarded: 'false' },
};

const getStatusBadge = (student) => {
    // Show Admin role pill first if applicable
    if (student.role === 'admin') return (
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <ShieldCheck className="w-4 h-4" /> Admin
        </span>
    );
    if (!student.isOnboarded) return (
        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <XCircle className="w-4 h-4" /> Not Onboarded
        </span>
    );
    if (student.isVerified) return (
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <CheckCircle2 className="w-4 h-4" /> Verified
        </span>
    );
    if (student.collegeFeeImg) return (
        <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <Clock className="w-4 h-4" /> Pending Review
        </span>
    );
    return (
        <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
            <XCircle className="w-4 h-4" /> Unverified
        </span>
    );
};

export const SuperAdminStudentList = () => {
    const { students, studentPagination, fetchStudents, loading } = useSuperAdminStore();
    const [searchParams, setSearchParams] = useSearchParams();

    const [search, setSearch] = useState('');
    const [activeFilter, setActiveFilter] = useState(searchParams.get('verified') === 'pending' ? 'pending' : 'all');
    const [page, setPage] = useState(1);

    const load = (overrides = {}) => {
        const base = filterToParam[activeFilter] ?? {};
        const params = { page, ...(search ? { search } : {}), ...base, ...overrides };
        fetchStudents(params);
    };

    useEffect(() => {
        load();
    }, [activeFilter, page]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        load({ page: 1 });
    };

    const handleFilterChange = (f) => {
        setActiveFilter(f);
        setPage(1);
    };

    const displayStudents = students;

    const totalPages = studentPagination?.totalPages ?? 1;

    return (
        <div className="max-w-7xl mx-auto space-y-6 py-10 w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link to="/super-admin/dashboard" className="flex items-center gap-1.5 text-gray-400 hover:text-purple-600 text-sm font-bold mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Dashboard
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 font-mangodolly flex items-center gap-3">
                        <Users className="w-8 h-8 text-blue-500" /> Student Verification
                        {studentPagination && (
                            <span className="text-base font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                {displayStudents.length} / {studentPagination.total}
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-500 font-medium text-xl mt-1">
                        Review fee receipts and approve student accounts.
                    </p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center">
                {/* Search */}
                <form onSubmit={handleSearch} className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, roll no, or email..."
                        className="input input-lg w-full border-2 focus:border-purple-500 focus:outline-none pl-10 font-semibold"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
                {/* Filters */}
                <div className="flex gap-2 flex-wrap justify-end flex-shrink-0">
                    <Filter className="w-5 h-5 text-gray-400 self-center" />
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => handleFilterChange(f)}
                            className={`btn btn-sm font-bold whitespace-nowrap border-none shadow transition-all ${activeFilter === f
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {filterLabels[f]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                {loading && displayStudents.length === 0 ? (
                    <div className="p-20 text-center">
                        <span className="loading loading-spinner loading-lg text-purple-600" />
                    </div>
                ) : displayStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="table table-lg w-full">
                            <thead>
                                <tr className="border-b border-gray-50 text-gray-400 font-black uppercase text-sm tracking-widest">
                                    <th className="bg-white">Student</th>
                                    <th className="bg-white">Dept / Class</th>
                                    <th className="bg-white">Roll No</th>
                                    <th className="bg-white">Status</th>
                                    <th className="bg-white text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {displayStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="bg-transparent">
                                            <div className="flex items-center gap-4">
                                                <img
                                                    src={student.profilePic || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.fullName || '?')}&background=random`}
                                                    alt={student.fullName}
                                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-900 text-lg group-hover:text-purple-600 transition-colors">
                                                        {student.fullName || '(No Name)'}
                                                    </p>
                                                    <p className="text-sm text-gray-400 font-medium">{student.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="bg-transparent font-semibold text-gray-600">
                                            {student.department || '—'} / {student.class || '—'}
                                        </td>
                                        <td className="bg-transparent font-mono font-bold text-gray-700">
                                            {student.rollNo || '—'}
                                        </td>
                                        <td className="bg-transparent">
                                            {getStatusBadge(student)}
                                        </td>
                                        <td className="bg-transparent text-right">
                                            <Link
                                                to={`/super-admin/students/${student._id}`}
                                                className="btn btn-sm bg-purple-50 hover:bg-purple-100 text-purple-700 border-none font-bold gap-2"
                                                title="View & Verify"
                                            >
                                                <Eye className="w-4 h-4" /> View & Verify
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-20 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">No students found</h3>
                        <p className="text-gray-500 mt-2 font-medium">Try a different search or filter.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                        className="btn btn-sm btn-ghost border border-gray-200 disabled:opacity-40"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="font-bold text-gray-600">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                        className="btn btn-sm btn-ghost border border-gray-200 disabled:opacity-40"
                    >
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

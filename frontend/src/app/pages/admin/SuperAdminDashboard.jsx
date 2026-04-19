import React, { useEffect } from 'react';
import {
    Users,
    ShieldCheck,
    CheckCircle2,
    Clock,
    ChevronRight,
    LayoutDashboard,
    UserCog,
    CalendarCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSuperAdminStore } from '../../store/superAdmin.store';
import { useUserStore } from '../../store/user.store';

export const SuperAdminDashboard = () => {
    const { user } = useUserStore();
    const { stats, adminCount, fetchStats, loading } = useSuperAdminStore();

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const statCards = [
        {
            label: 'Total Users',
            value: stats?.totalAllUsers ?? '—',
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            border: 'border-blue-200',
        },
        {
            label: 'Total Admins',
            value: adminCount ?? stats?.totalAdmins ?? '—',
            icon: UserCog,
            color: 'text-indigo-600',
            bg: 'bg-indigo-100',
            border: 'border-indigo-200',
        },
        {
            label: 'Verified Students',
            value: stats?.verified ?? '—',
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-100',
            border: 'border-emerald-200',
        },
        {
            label: 'Pending Verification',
            value: stats?.pendingVerification ?? '—',
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-100',
            border: 'border-amber-200',
        },
    ];

    const quickActions = [
        {
            label: 'Verify Students',
            desc: 'Review fee receipts and approve student accounts.',
            href: '/super-admin/students',
            iconBg: 'bg-blue-600',
            icon: Users,
        },
        {
            label: 'Verify Events',
            desc: 'Review submitted events and publish or reject them.',
            href: '/super-admin/events',
            iconBg: 'bg-purple-600',
            icon: CalendarCheck,
        },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500 py-10 w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <ShieldCheck className="w-8 h-8 text-purple-600" />
                        <span className="text-sm font-black uppercase tracking-widest text-purple-500 bg-purple-100 px-3 py-1 rounded-full">
                            Super Admin
                        </span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 font-mangodolly">
                        Welcome back,{' '}
                        <span className="text-purple-600">
                            {user?.fullName?.split(' ')[0] || 'Chief'}!
                        </span>
                    </h1>
                    <p className="text-gray-500 text-2xl font-medium mt-1">
                        Here's a snapshot of your platform today.
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {statCards.map((stat, idx) => (
                    <div
                        key={idx}
                        className={`bg-white p-5 rounded-xl border ${stat.border} shadow-sm hover:shadow-md transition-shadow`}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-lg font-bold text-gray-400 uppercase tracking-wider">
                                    {stat.label}
                                </p>
                                <h3 className="text-5xl font-mangodolly font-black text-gray-800 mt-2">
                                    {loading && stat.value === '—' ? (
                                        <span className="loading loading-dots loading-md text-gray-300" />
                                    ) : (
                                        stat.value
                                    )}
                                </h3>
                            </div>
                            <div className={`${stat.bg} ${stat.color} p-3 rounded-xl flex-shrink-0`}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <div className="flex items-center gap-2 mb-5 px-1">
                    <LayoutDashboard className="w-7 h-7 text-pink-500" />
                    <h2 className="text-3xl font-bold text-gray-800">Quick Actions</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {quickActions.map((action) => (
                        <Link
                            key={action.href}
                            to={action.href}
                            className="group bg-white hover:bg-gray-50 border border-gray-100 rounded-xl p-7 shadow-sm hover:shadow-md transition-all flex items-center gap-6"
                        >
                            <div className={`${action.iconBg} p-4 rounded-xl text-white flex-shrink-0`}>
                                <action.icon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-black text-gray-900 group-hover:text-purple-600 transition-colors font-mangodolly">
                                    {action.label}
                                </h3>
                                <p className="text-gray-500 font-medium mt-1 text-lg">{action.desc}</p>
                            </div>
                            <ChevronRight className="w-7 h-7 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* Summary Strip */}
            {stats && (
                <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl p-7 text-white shadow-xl">
                    <h3 className="font-black text-2xl mb-1">Platform at a Glance</h3>
                    <p className="text-purple-200 text-lg mb-5">
                        {stats.pendingVerification > 0
                            ? `${stats.pendingVerification} student(s) are waiting for your approval.`
                            : 'All students are up to date — great job!'}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            to="/super-admin/students?verified=pending"
                            className="btn btn-md bg-white/20 hover:bg-white/30 border-none text-white font-bold backdrop-blur"
                        >
                            <Clock className="w-4 h-4 mr-1" />
                            Pending Reviews ({stats.pendingVerification})
                        </Link>
                        <Link
                            to="/super-admin/events"
                            className="btn btn-md bg-white/20 hover:bg-white/30 border-none text-white font-bold backdrop-blur"
                        >
                            <CalendarCheck className="w-4 h-4 mr-1" />
                            Verify Events
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

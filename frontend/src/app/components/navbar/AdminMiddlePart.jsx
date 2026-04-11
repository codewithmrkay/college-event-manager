import { useLocation, useNavigate } from "react-router-dom";
import { useUserStore } from "../../store/user.store";

export const AdminMiddlePart = ({ isMobile, setIsMobileMenuOpen }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();
    const { user } = useUserStore();

    const isSuperAdmin = user?.role === 'super-admin';

    // Super-admins get their own nav links
    const navpages = isSuperAdmin
        ? ['Home', 'Dashboard', 'Verify Students', 'Verify Events']
        : ['Home', 'Dashboard', 'Manage Events'];

    const getPath = (val) => {
        if (val === 'Home') return '/';
        if (val === 'Dashboard') return isSuperAdmin ? '/super-admin/dashboard' : '/admin-dashboard';
        if (val === 'Manage Events') return '/admin/events';
        if (val === 'Verify Students') return '/super-admin/students';
        if (val === 'Verify Events') return '/super-admin/events';
        return '/';
    };

    const handleclick = (val) => {
        navigate(getPath(val));
        if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    return (
        <div className={isMobile ? 'w-full' : ''}>
            <div className={`flex ${isMobile ? 'flex-col items-start gap-4 w-full' : 'items-center justify-center gap-5'} font-medium`}>
                {navpages.map((page) => {
                    const pagePath = getPath(page);
                    const isActive =
                        currentPath === pagePath ||
                        (page === 'Manage Events' && currentPath.startsWith('/admin/events/')) ||
                        (page === 'Verify Students' && currentPath.startsWith('/super-admin/students')) ||
                        (page === 'Verify Events' && currentPath.startsWith('/super-admin/events'));

                    return (
                        <li
                            key={page}
                            onClick={() => handleclick(page)}
                            className={`cursor-pointer list-none transition-all duration-300 ease-in-out
                                ${isMobile ? 'text-2xl w-full py-2 border-b border-gray-100 block' : 'text-xl'}
                                ${isActive
                                    ? 'underline decoration-blue-500 text-gray-800 underline-offset-6 decoration-4'
                                    : 'text-gray-400 hover:text-gray-800'
                                }`}
                        >
                            {page}
                        </li>
                    );
                })}
            </div>
        </div>
    );
};

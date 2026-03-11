import { useLocation, useNavigate } from "react-router-dom";

export const AdminMiddlePart = ({ isMobile, setIsMobileMenuOpen }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();

    const navpages = ['Home', 'Dashboard', 'Manage Events'];

    const handleclick = (val) => {
        let path = '/';
        if (val === 'Dashboard') path = '/admin-dashboard';
        if (val === 'Manage Events') path = '/admin/events';
        navigate(path);
        if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    return (
        <div className={isMobile ? 'w-full' : ''}>
            <div className={`flex ${isMobile ? 'flex-col items-start gap-4 w-full' : 'items-center justify-center gap-5'} font-medium`}>
                {navpages.map((page) => {
                    let pagePath = '/';
                    if (page === 'Dashboard') pagePath = '/admin-dashboard';
                    if (page === 'Manage Events') pagePath = '/admin/events';

                    // Exact match for admin root, otherwise startsWith is tricky, so let's do exact match except maybe for events
                    const isActive = currentPath === pagePath || (page === 'Manage Events' && currentPath.startsWith('/admin/events/'));

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

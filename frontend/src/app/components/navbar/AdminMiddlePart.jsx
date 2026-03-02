import { useLocation, useNavigate } from "react-router-dom";

export const AdminMiddlePart = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();

    const navpages = ['Home', 'Dashboard', 'Manage Events'];

    const handleclick = (val) => {
        let path = '/';
        if (val === 'Dashboard') path = '/admin-dashboard';
        if (val === 'Manage Events') path = '/admin/events';
        navigate(path);
    };

    return (
        <div>
            <div className="flex items-center justify-center gap-5 font-medium">
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
                            className={`cursor-pointer list-none text-xl transition-all duration-300 ease-in-out
                                ${isActive
                                    ? 'underline decoration-blue-500 text-gray-500 underline-offset-6 decoration-4'
                                    : 'text-gray-400 hover:text-gray-500'
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

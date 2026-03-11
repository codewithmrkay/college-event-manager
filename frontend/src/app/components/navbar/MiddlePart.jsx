import { useLocation, useNavigate } from "react-router-dom";

export const MiddlePart = ({ isMobile, setIsMobileMenuOpen }) => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();

    const navpages = ['Home', 'Dashboard', 'Events', 'Applications'];

    const handleclick = (val) => {
        const path = val === 'Home' ? '/' : `/${val.toLowerCase()}`;
        navigate(path);
        if (setIsMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    return (
        <div className={isMobile ? 'w-full' : ''}>
            <div className={`flex ${isMobile ? 'flex-col items-start gap-4 w-full' : 'items-center justify-center gap-5'} font-medium`}>
                {navpages.map((page) => {
                    const pagePath = page === 'Home' ? '/' : `/${page.toLowerCase()}`;
                    const isActive = currentPath === pagePath;
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
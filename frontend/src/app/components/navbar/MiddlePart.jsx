import { useLocation, useNavigate } from "react-router-dom";

export const MiddlePart = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const navigate = useNavigate();

    const navpages = ['Home', 'Events', 'Applications'];

    const handleclick = (val) => {
        const path = val === 'Home' ? '/' : `/${val.toLowerCase()}`;
        navigate(path);
    };

    return (
        <div>
            <div className="flex items-center justify-center gap-5 font-medium">
                {navpages.map((page) => {
                    const pagePath = page === 'Home' ? '/' : `/${page.toLowerCase()}`;
                    const isActive = currentPath === pagePath;
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
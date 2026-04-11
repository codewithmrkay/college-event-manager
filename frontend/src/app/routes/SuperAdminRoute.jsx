import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/user.store";
import { useEffect, useState } from "react";

/**
 * Route guard — only role === 'super-admin' is allowed.
 * Admins are redirected to /admin-dashboard.
 * Everyone else goes to /dashboard.
 */
export const SuperAdminRoute = ({ children }) => {
    const { user, getProfile } = useUserStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            if (!user) {
                await getProfile();
            }
            setIsChecking(false);
        };
        checkAuth();
    }, [getProfile, user]);

    if (isChecking) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <span className="loading loading-bars loading-xl text-purple-600" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    if (user.role !== "super-admin") {
        // Admins can still go to admin dashboard; others go to student dashboard
        return <Navigate to={user.role === "admin" ? "/admin-dashboard" : "/dashboard"} replace />;
    }

    return children;
};

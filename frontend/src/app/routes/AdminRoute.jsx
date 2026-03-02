import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/user.store";
import { useEffect, useState } from "react";

export const AdminRoute = ({ children }) => {
    const { user, getProfile } = useUserStore();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            // If user already exists in store, no need to fetch again
            if (!user) {
                await getProfile();
            }
            setIsChecking(false);
        };
        checkAuth();
    }, [getProfile, user]);

    if (isChecking) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    // After checking, if still no user, or user doesn't have required role
    if (!user || (user.role !== "admin" && user.role !== "super-admin")) {
        console.log("AdminRoute - Access Denied for user:", user);
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

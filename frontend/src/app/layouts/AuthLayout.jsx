import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast"
import { useEffect } from "react";
export const AuthLayout = () => {
    const location = useLocation();

  useEffect(() => {
    // Dismisses all active toasts when the path changes
    toast.dismiss(); 
  }, [location.pathname]);
    return (
        <div className="min-h-screen flex items-center justify-center">
            <Outlet />
        </div>
    );
};



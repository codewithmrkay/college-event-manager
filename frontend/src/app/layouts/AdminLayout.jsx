import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { AdminNavbar } from "../components/navbar/AdminNavbar";

export const AdminLayout = () => {
    const location = useLocation();
    const { user } = useAuthStore();

    const isSuperAdmin = user?.role === "super-admin";

    return (
        <div className="px-2 lg:px-4 bg-base-300">
            <div className="fixed top-0 left-0 w-full z-10 bg-white ">
                <AdminNavbar />
            </div>
            <main className="flex items-center justify-between w-full mx-auto max-w-6xl pt-15 bg-base-300">
                <Outlet />
            </main>
        </div>
    );
};

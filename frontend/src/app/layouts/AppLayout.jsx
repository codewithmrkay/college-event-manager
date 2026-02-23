import { Outlet } from "react-router-dom";
import { Navbar } from "../components/navbar/Navbar";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";
export const AppLayout = () => {
  const location = useLocation();

  useEffect(() => {
    toast.dismiss();
  }, [location.pathname]);
  return (
    <div className="px-2 lg:px-4 bg-base-200">
      <div className="fixed top-0 left-0 w-full px-2 lg:px-4 z-10 bg-white ">
        <Navbar />
      </div>
      <main className="flex items-center justify-between w-full mx-auto max-w-6xl pt-15 bg-base-200">
        <Outlet />
      </main>
    </div>
  );
};



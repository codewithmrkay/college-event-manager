import { Outlet } from "react-router-dom";
import { Navbar } from "../components/navbar/Navbar";
export const AppLayout = () => {
  return (
    <div className="px-2 lg:px-4 ">
      <div className="fixed top-0 left-0 w-full px-2 lg:px-4 z-10 bg-white ">
        <Navbar />
      </div>
      <main className="flex items-center justify-between w-full mx-auto max-w-6xl pt-15">
        <Outlet />
      </main>
    </div>
  );
};



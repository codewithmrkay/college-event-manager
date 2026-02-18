import {createBrowserRouter} from "react-router-dom"
import { Home } from "../pages/Home";
import { SignUp } from "../pages/SignUp";
import { AuthLayout } from "../layouts/AuthLayout";
import { AppLayout } from "../layouts/AppLayout";
import { Events } from "../pages/Events";
import { Applications } from "../pages/Applications";
import { SignIn } from "../pages/SignIn";
import { Profile } from "../pages/Profile";
import { VerifyOtp } from "../pages/VerifyOtp";
const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/signin", element: <SignIn /> },
      { path: "/signup", element: <SignUp /> },
      { path: "/verify-otp", element: <VerifyOtp /> },
    ],
  },
  {
    element: (
      // <ProtectedRoute>
        <AppLayout />
      // </ProtectedRoute>
    ),
    children: [
      { path: "/", element: <Home /> },
      { path: "/events", element: <Events /> },
      { path: "/applications", element: <Applications /> },
      { path: "/profile", element: <Profile /> },
    ],
  },
  // {
  //   path: "/admin",
  //   element: (
  //     <AdminRoute>
  //       <AdminLayout />
  //     </AdminRoute>
  //   ),
  //   children: [{ index: true, element: <AdminDashboard /> }],
  // },
]);

export default router;

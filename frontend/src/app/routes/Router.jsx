import { createBrowserRouter } from "react-router-dom"
import { Home } from "../pages/Home";
import { SignUp } from "../pages/SignUp";
import { AuthLayout } from "../layouts/AuthLayout";
import { AppLayout } from "../layouts/AppLayout";
import { Dashboard } from "../pages/Dashboard"
import { Events } from "../pages/Events";
import { Applications } from "../pages/Applications";
import { SignIn } from "../pages/SignIn";
import { Profile } from "../pages/Profile";
import { VerifyOtp } from "../pages/VerifyOtp";

import { AdminRoute } from "./AdminRoute";
import { SuperAdminRoute } from "./SuperAdminRoute";
import { AdminLayout } from "../layouts/AdminLayout";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import { AdminEventList } from "../pages/admin/AdminEventList";
import { SuperAdminVerifyList } from "../pages/admin/SuperAdminVerifyList";
import { CreateEvent } from "../pages/admin/CreateEvent";
import { EventParticipants } from "../pages/admin/EventParticipants";
import EventDetails from "../pages/EventDetails";

// Super-Admin pages
import { SuperAdminDashboard } from "../pages/admin/SuperAdminDashboard";
import { SuperAdminStudentList } from "../pages/admin/SuperAdminStudentList";
import { SuperAdminStudentDetail } from "../pages/admin/SuperAdminStudentDetail";
import { SuperAdminEventList } from "../pages/admin/SuperAdminEventList";
import { SuperAdminEventDetail } from "../pages/admin/SuperAdminEventDetail";

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
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/events", element: <Events /> },
      { path: "/events/:idOrSlug", element: <EventDetails /> },
      { path: "/applications", element: <Applications /> },
      { path: "/profile", element: <Profile /> },
    ],
  },
  {
    // path: "/admin-dashboard",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      { path: "/admin-dashboard", element: <AdminDashboard /> },
      { path: "/admin/events", element: <AdminEventList /> },
      { path: "/admin/events/verify", element: <SuperAdminVerifyList /> },
      { path: "/admin/events/create", element: <CreateEvent /> },
      { path: "/admin/events/edit/:idOrSlug", element: <CreateEvent /> },
      { path: "/admin/events/:idOrSlug/participants", element: <EventParticipants /> },
      { path: "/admin/events/:idOrSlug", element: <EventDetails /> },
    ],
  },
  {
    element: (
      <SuperAdminRoute>
        <AdminLayout />
      </SuperAdminRoute>
    ),
    children: [
      { path: "/super-admin/dashboard", element: <SuperAdminDashboard /> },
      { path: "/super-admin/students", element: <SuperAdminStudentList /> },
      { path: "/super-admin/students/:id", element: <SuperAdminStudentDetail /> },
      { path: "/super-admin/events", element: <SuperAdminEventList /> },
      { path: "/super-admin/events/:id", element: <SuperAdminEventDetail /> },
    ],
  },
]);

export default router;

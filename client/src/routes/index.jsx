import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../components/layout/RootLayout.jsx';
import { ProtectedRoute } from './guards.jsx';
import { publicRoutes } from './PublicRoutes.jsx';
import { adminChildren } from './AdminRoutes.jsx';
import RouteError, { AdminRouteError } from '../pages/errors/RouteError.jsx';
import NotFound from '../pages/errors/NotFound.jsx';
import { S } from './lazy.jsx';

const Login          = lazy(() => import('../pages/Login.jsx'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword.jsx'));
const ResetPassword  = lazy(() => import('../pages/ResetPassword.jsx'));
const AdminLayout = lazy(() => import('../admin/AdminLayout.jsx'));

export const router = createBrowserRouter([
  // ── Login (public, outside the site chrome) ──
  { path: '/login', element: S(<Login />), errorElement: <RouteError /> },
  { path: '/forgot-password', element: S(<ForgotPassword />), errorElement: <RouteError /> },
  { path: '/reset-password', element: S(<ResetPassword />), errorElement: <RouteError /> },

  // ── PUBLIC (nested under RootLayout — shared header/nav/footer) ──
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteError />,       // errors in any public route render here
    children: [
      ...publicRoutes,
      { path: '*', element: <NotFound /> },   // 404 within the site chrome
    ],
  },

  // ── ADMIN (protected + nested under AdminLayout) ──
  {
    path: '/admin',
    element: <ProtectedRoute>{S(<AdminLayout />)}</ProtectedRoute>,
    errorElement: <AdminRouteError />,
    children: [
      ...adminChildren,
      { path: '*', element: <NotFound /> },   // 404 within the admin shell
    ],
  },
]);

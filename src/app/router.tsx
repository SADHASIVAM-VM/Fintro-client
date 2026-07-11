import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PublicRoute } from '@/features/auth/PublicRoute';
import { ProtectedRoute } from '@/features/auth/ProtectedRoute';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { ROUTES } from '@/constants';

// Lazily load feature views
const Login = lazy(() => import('@/features/auth/Login'));
const Register = lazy(() => import('@/features/auth/Register'));
const Dashboard = lazy(() => import('@/features/dashboard/Dashboard'));
const UsersList = lazy(() => import('@/features/users/UsersList'));
const Settings = lazy(() => import('@/features/settings/Settings'));

const Expenses = lazy(() => import('@/features/expenses/Expenses'));
const Ledger = lazy(() => import('@/features/borrow/Ledger'));
const RoomManagement = lazy(() => import('@/features/room/RoomManagement'));
const LoansGoals = lazy(() => import('@/features/emi/LoansGoals'));
const Reports = lazy(() => import('@/features/reports/Reports'));

// Lazily load error pages
const NotFound = lazy(() => import('@/pages/NotFound'));
const Forbidden = lazy(() => import('@/pages/Forbidden'));
const ServerError = lazy(() => import('@/pages/ServerError'));

const Loader = () => (
  <div className="flex h-[75vh] w-full items-center justify-center bg-background text-foreground">
    <LoadingSpinner size="lg" />
  </div>
);

export const router = createBrowserRouter([
  // Public Paths (Auth Flow)
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: ROUTES.LOGIN,
            element: (
              <Suspense fallback={<Loader />}>
                <Login />
              </Suspense>
            ),
          },
          {
            path: ROUTES.REGISTER,
            element: (
              <Suspense fallback={<Loader />}>
                <Register />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  
  // Protected Paths (Dashboard Flow)
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            path: ROUTES.DASHBOARD,
            element: (
              <Suspense fallback={<Loader />}>
                <Dashboard />
              </Suspense>
            ),
          },
          {
            path: ROUTES.USERS,
            element: (
              <Suspense fallback={<Loader />}>
                <UsersList />
              </Suspense>
            ),
          },
          {
            path: ROUTES.EXPENSES,
            element: (
              <Suspense fallback={<Loader />}>
                <Expenses />
              </Suspense>
            ),
          },
          {
            path: ROUTES.LEDGER,
            element: (
              <Suspense fallback={<Loader />}>
                <Ledger />
              </Suspense>
            ),
          },
          {
            path: ROUTES.ROOM,
            element: (
              <Suspense fallback={<Loader />}>
                <RoomManagement />
              </Suspense>
            ),
          },
          {
            path: ROUTES.LOANS,
            element: (
              <Suspense fallback={<Loader />}>
                <LoansGoals />
              </Suspense>
            ),
          },
          {
            path: ROUTES.REPORTS,
            element: (
              <Suspense fallback={<Loader />}>
                <Reports />
              </Suspense>
            ),
          },
          {
            path: ROUTES.SETTINGS,
            element: (
              <Suspense fallback={<Loader />}>
                <Settings />
              </Suspense>
            ),
          },
          {
            path: ROUTES.UNAUTHORIZED,
            element: (
              <Suspense fallback={<Loader />}>
                <Forbidden />
              </Suspense>
            ),
          },
          {
            path: ROUTES.SERVER_ERROR,
            element: (
              <Suspense fallback={<Loader />}>
                <ServerError />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  
  // 404 Catch All Route
  {
    path: '*',
    element: (
      <Suspense fallback={<Loader />}>
        <NotFound />
      </Suspense>
    ),
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
export default AppRouter;

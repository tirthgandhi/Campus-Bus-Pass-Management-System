import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleRoute from './RoleRoute';
import { getDashboardPath } from './rolePaths';
import AppLayout from '../components/AppLayout';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import StudentRegister from '../pages/StudentRegister';
import DriverRegister from '../pages/DriverRegister';
import Dashboard from '../pages/Dashboard';
import ErrorPage from '../pages/ErrorPage';

// Admin Module Components & Pages
import AdminLayout from '../../admin/components/AdminLayout';
import AdminDashboard from '../../admin/pages/AdminDashboard';
import ManageStudents from '../../admin/pages/ManageStudents';
import ManageDrivers from '../../admin/pages/ManageDrivers';
import ManageBuses from '../../admin/pages/ManageBuses';
import ManageRoutes from '../../admin/pages/ManageRoutes';
import ManagePickupPoints from '../../admin/pages/ManagePickupPoints';
import ManageRequests from '../../admin/pages/ManageRequests';
import ManageAssignments from '../../admin/pages/ManageAssignments';
import ViewAttendance from '../../admin/pages/ViewAttendance';
import Reports from '../../admin/pages/Reports';
import AdminProfile from '../../admin/pages/AdminProfile';

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const titles = {
      '/': 'University Transportation Portal',
      '/login': 'Sign In',
      '/register/student': 'Student Registration',
      '/register/driver': 'Driver Registration',
      '/unauthorized': 'Access Denied',
      '/admin/dashboard': 'Admin Dashboard',
      '/admin/students': 'Manage Students',
      '/admin/drivers': 'Manage Drivers',
      '/admin/buses': 'Manage Buses',
      '/admin/routes': 'Manage Routes',
      '/admin/pickup-points': 'Manage Pickup Points',
      '/admin/requests': 'Transport Requests',
      '/admin/assignments': 'Bus Assignments',
      '/admin/attendance': 'Attendance',
      '/admin/reports': 'Reports',
      '/admin/profile': 'Admin Profile',
    };
    document.title = `${titles[pathname] || (pathname.endsWith('/dashboard') ? 'Dashboard' : 'Page Not Found')} | Campus Bus`;
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
    else window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

export default function AppRoutes() {
  return (
    <>
      <RouteEffects />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/driver" element={<DriverRegister />} />
        <Route path="/signup" element={<Navigate to="/register/student" replace />} />

        {/* Global Dashboard Redirect */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          }
        />

        {/* Student & Driver Roles */}
        {['student', 'driver'].map((role) => (
          <Route key={role} element={<RoleRoute role={role} />}>
            <Route element={<AppLayout />}>
              <Route path={`/${role}/dashboard`} element={<Dashboard />} />
            </Route>
          </Route>
        ))}

        {/* Admin Role with Admin Portal UI */}
        <Route element={<RoleRoute role="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<ManageStudents />} />
            <Route path="/admin/drivers" element={<ManageDrivers />} />
            <Route path="/admin/buses" element={<ManageBuses />} />
            <Route path="/admin/routes" element={<ManageRoutes />} />
            <Route path="/admin/pickup-points" element={<ManagePickupPoints />} />
            <Route path="/admin/requests" element={<ManageRequests />} />
            <Route path="/admin/assignments" element={<ManageAssignments />} />
            <Route path="/admin/attendance" element={<ViewAttendance />} />
            <Route path="/admin/reports" element={<Reports />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* Error / Unauthorized */}
        <Route path="/unauthorized" element={<ErrorPage forbidden />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </>
  );
}

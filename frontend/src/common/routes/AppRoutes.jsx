import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { getDashboardPath, ROLES } from './rolePaths';
import DashboardLayout from '../layouts/DashboardLayout';
import PublicLayout from '../layouts/PublicLayout';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import StudentRegister from '../pages/StudentRegister';
import DriverRegister from '../pages/DriverRegister';
import Dashboard from '../pages/Dashboard';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';

function DashboardRedirect() {
  const { user } = useAuth();
  return <Navigate to={getDashboardPath(user.role)} replace />;
}
function RouteEffects() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    const titles = { '/': 'University Transportation Portal', '/login': 'Sign In', '/register/student': 'Student Registration', '/register/driver': 'Driver Registration', '/unauthorized': 'Access Denied' };
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
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/driver" element={<DriverRegister />} />
        <Route path="/signup" element={<Navigate to="/register/student" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
        {ROLES.map(role => (
          <Route key={role} element={<RoleRoute role={role} />}>
            <Route element={<DashboardLayout />}>
              <Route path={`/${role}/dashboard`} element={<Dashboard />} />
              {/* Add role module pages here when their functionality is implemented. */}
            </Route>
          </Route>
        ))}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

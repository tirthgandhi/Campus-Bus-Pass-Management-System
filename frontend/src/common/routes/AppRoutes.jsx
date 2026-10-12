import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleRoute from './RoleRoute';
import { getDashboardPath, ROLES } from './rolePaths';
import AppLayout from '../components/AppLayout';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import StudentRegister from '../pages/StudentRegister';
import DriverRegister from '../pages/DriverRegister';
import Dashboard from '../pages/Dashboard';
import ErrorPage from '../pages/ErrorPage';

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
  return <><RouteEffects /><Routes><Route path="/" element={<Landing />} /><Route path="/login" element={<Login />} /><Route path="/register/student" element={<StudentRegister />} /><Route path="/register/driver" element={<DriverRegister />} /><Route path="/signup" element={<Navigate to="/register/student" replace />} /><Route path="/dashboard" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
    {ROLES.map(role => <Route key={role} element={<RoleRoute role={role} />}><Route element={<AppLayout />}><Route path={`/${role}/dashboard`} element={<Dashboard />} />{/* Add each role's module routes here as they become available. */}</Route></Route>)}
    <Route path="/unauthorized" element={<ErrorPage forbidden />} /><Route path="*" element={<ErrorPage />} /></Routes></>;
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * ProtectedRoute — guards authenticated routes
 * Shows loader while session is restoring, redirects to /login if unauthenticated
 * @param {React.ReactNode} children - Page to render if authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default ProtectedRoute;

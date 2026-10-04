import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

/**
 * ProtectedRoute Component
 * Guards routes that require authentication and optionally specific roles
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} props.requiredRole - Optional role required to access this route
 * @param {string} props.redirectTo - Where to redirect if not authorized (default: '/login')
 */
const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  redirectTo = '/login' 
}) => {
  const { user, loading, isAuthenticated, hasRole } = useAuth();

  // Show loader while authentication state is being determined
  if (loading) {
    return <Loader message="Verifying authentication..." />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check role-based access if required role is specified
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="access-denied">
        <div className="access-denied-content">
          <div className="access-denied-icon">🚫</div>
          <h2>Access Denied</h2>
          <p>
            You don't have permission to access this page. 
            This page requires <strong>{requiredRole}</strong> role, 
            but you are logged in as <strong>{user?.role}</strong>.
          </p>
          <div className="access-denied-actions">
            <button 
              onClick={() => window.history.back()}
              className="btn-secondary"
            >
              Go Back
            </button>
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and has required role (if specified)
  return children;
};

export default ProtectedRoute;
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from './Loader';

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, loading, isAuthenticated, sessionError, retrySession, logout } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (sessionError) {
    return (
      <main className="session-recovery" aria-labelledby="session-title">
        <h1 id="session-title">Let's reconnect</h1>
        <p className="alert alert-error" role="alert">{sessionError}</p>
        <p>Your session is saved. Try connecting again to continue.</p>
        <button className="btn btn-primary" type="button" onClick={retrySession}>Try again</button>
        <button className="text-link" type="button" onClick={logout}>Return to sign in</button>
      </main>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (requiredRole && user.role !== requiredRole) return <Navigate to="/unauthorized" replace />;
  return children ?? <Outlet />;
}

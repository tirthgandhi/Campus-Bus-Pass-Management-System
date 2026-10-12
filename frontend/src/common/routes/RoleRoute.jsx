import ProtectedRoute from '../components/ProtectedRoute';

export default function RoleRoute({ role, requiredRole, children }) {
  return <ProtectedRoute requiredRole={role ?? requiredRole}>{children}</ProtectedRoute>;
}

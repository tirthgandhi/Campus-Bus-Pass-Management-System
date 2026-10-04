import { useAuth } from '../context/AuthContext';
import './Navbar.css';

/**
 * Navbar Component
 * Top navigation bar with branding, user info, and logout
 */
const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-icon">🚌</span>
        <span className="navbar-title">CampusBus</span>
      </div>
      
      {user && (
        <div className="navbar-user">
          <span className="role-badge role-badge--{user.role}">{user.role}</span>
          <span className="user-name">{user.name}</span>
          <button 
            className="logout-btn" 
            onClick={handleLogout}
            title="Logout from your account"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
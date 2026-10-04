import { useAuth } from '../context/AuthContext';
import './Navbar.css';

/**
 * Navbar — sticky top navigation bar with branding, user info, and sign out
 */
const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="navbar-logo">CampusBus</span>
      </div>

      {user && (
        <div className="navbar-right">
          <div className="navbar-user-info">
            <span className="navbar-username">{user.name}</span>
            <span className={`navbar-role-badge navbar-role-badge--${user.role}`}>
              {user.role}
            </span>
          </div>
          <button className="navbar-logout" onClick={logout}>
            Sign Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

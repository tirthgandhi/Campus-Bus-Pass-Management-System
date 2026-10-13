import { NavLink, Link } from 'react-router-dom';
import Icon from '../../common/components/Icon';
import { useAuth } from '../../common/context/AuthContext';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: 'layout' },
  { label: 'Students', path: '/admin/students', icon: 'users' },
  { label: 'Drivers', path: '/admin/drivers', icon: 'user' },
  { label: 'Buses', path: '/admin/buses', icon: 'bus' },
  { label: 'Routes', path: '/admin/routes', icon: 'route' },
  { label: 'Pickup Points', path: '/admin/pickup-points', icon: 'map-pin' },
  { label: 'Transport Requests', path: '/admin/requests', icon: 'send' },
  { label: 'Assignments', path: '/admin/assignments', icon: 'id-card' },
  { label: 'Attendance', path: '/admin/attendance', icon: 'clipboard-check' },
  { label: 'Reports', path: '/admin/reports', icon: 'file-text' },
];

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  onRequestLogout,
}) {
  const { user } = useAuth();
  const displayName = user?.name || 'Administrator';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <aside
      className={`admin-sidebar ${collapsed ? 'admin-sidebar-collapsed' : ''} ${
        mobileOpen ? 'open' : ''
      }`}
      aria-label="Admin Navigation Sidebar"
    >
      <div className="admin-sidebar-header">
        <Link
          to="/admin/dashboard"
          className="admin-sidebar-brand"
          onClick={onCloseMobile}
        >
          <div className="admin-sidebar-logo" aria-hidden="true">
            <Icon name="bus" size={22} />
          </div>
          <div className="admin-brand-text">
            <span className="admin-brand-title">Campus Bus</span>
            <span className="admin-brand-subtitle">Admin Portal</span>
          </div>
        </Link>
        <button
          type="button"
          className="admin-sidebar-toggle-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Icon name="panel-left" size={18} />
        </button>
      </div>

      <nav className="admin-sidebar-nav" aria-label="Main Admin Navigation">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `admin-nav-item ${isActive ? 'active' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <Icon name={item.icon} size={19} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <Link
          to="/admin/profile"
          className="admin-sidebar-profile-card"
          onClick={onCloseMobile}
          title={collapsed ? `${displayName} (Administrator)` : undefined}
        >
          <div className="admin-avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="admin-sidebar-user-info">
            <span className="admin-sidebar-user-name">{displayName}</span>
            <span className="admin-sidebar-user-role">Administrator</span>
          </div>
        </Link>
        <button
          type="button"
          className="admin-sidebar-logout-btn"
          onClick={onRequestLogout}
          title={collapsed ? 'Logout' : undefined}
        >
          <Icon name="logout" size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

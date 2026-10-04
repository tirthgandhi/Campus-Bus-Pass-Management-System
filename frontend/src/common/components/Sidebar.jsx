import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

/* Menu items per role */
const MENUS = {
  student: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Transport Request', path: '/student/request' },
    { label: 'My Bus Pass', path: '/student/pass' },
    { label: 'My Attendance', path: '/student/attendance' },
  ],
  driver: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Bus & Route', path: '/driver/bus' },
    { label: 'Verify Bus Pass', path: '/driver/verify' },
    { label: 'Mark Attendance', path: '/driver/attendance' },
    { label: 'Report Problem', path: '/driver/problem' },
  ],
  admin: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Students', path: '/admin/students' },
    { label: 'Drivers', path: '/admin/drivers' },
    { label: 'Buses', path: '/admin/buses' },
    { label: 'Routes', path: '/admin/routes' },
    { label: 'Pickup Points', path: '/admin/pickups' },
    { label: 'Requests', path: '/admin/requests' },
  ],
};

/**
 * Sidebar — role-specific navigation with active link highlighting
 */
const Sidebar = () => {
  const { user } = useAuth();
  const menuItems = MENUS[user?.role] || [];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              isActive ? 'sidebar-link sidebar-link--active' : 'sidebar-link'
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

import { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Icon from '../../common/components/Icon';
import { useAuth } from '../../common/context/AuthContext';

const PAGE_TITLES = {
  '/admin/dashboard': { title: 'Dashboard', subtitle: 'Overview of campus transportation operations' },
  '/admin/students': { title: 'Manage Students', subtitle: 'View and manage registered students' },
  '/admin/drivers': { title: 'Manage Drivers', subtitle: 'Fleet drivers and contact information' },
  '/admin/buses': { title: 'Manage Buses', subtitle: 'University bus fleet and vehicle statuses' },
  '/admin/routes': { title: 'Manage Routes', subtitle: 'Campus transit routes and timings' },
  '/admin/pickup-points': { title: 'Manage Pickup Points', subtitle: 'Designated student boarding stops' },
  '/admin/requests': { title: 'Transport Requests', subtitle: 'Student bus pass enrollment applications' },
  '/admin/assignments': { title: 'Bus Assignments', subtitle: 'Student bus pass seat allocations' },
  '/admin/attendance': { title: 'Attendance', subtitle: 'Daily boarding logs and attendance verification' },
  '/admin/reports': { title: 'Reports', subtitle: 'Operations, capacity, and route analytics' },
  '/admin/profile': { title: 'Admin Profile', subtitle: 'Administrator account details and settings' },
};

export default function AdminNavbar({ onToggleMobile, onRequestLogout }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  const currentMeta = PAGE_TITLES[pathname] || { title: 'Admin Portal', subtitle: 'University transport administration' };

  const displayName = user?.name || 'Administrator';
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('pointerdown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="admin-navbar">
      <div className="admin-navbar-left">
        <button
          type="button"
          className="admin-mobile-menu-btn"
          onClick={onToggleMobile}
          aria-label="Open sidebar menu"
        >
          <Icon name="menu" size={20} />
        </button>
        <div className="admin-page-title-badge">
          <h1 className="admin-navbar-title">{currentMeta.title}</h1>
          <span className="admin-navbar-subtitle">{currentMeta.subtitle}</span>
        </div>
      </div>

      <div className="admin-navbar-right">
        <div className="admin-navbar-search">
          <Icon name="search" size={16} />
          <input
            type="search"
            placeholder="Quick search..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Quick search"
          />
        </div>

        <div className="admin-navbar-profile">
          <button
            type="button"
            ref={triggerRef}
            className="admin-profile-trigger"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
          >
            <div className="admin-avatar" aria-hidden="true">
              {initials}
            </div>
            <div className="admin-profile-meta">
              <span className="admin-profile-name">{displayName}</span>
              <span className="admin-profile-role">Administrator</span>
            </div>
            <Icon name="chevron-down" size={15} style={{ color: 'var(--admin-text-secondary)' }} />
          </button>

          {dropdownOpen && (
            <div ref={dropdownRef} className="admin-dropdown-menu" role="menu">
              <Link
                to="/admin/profile"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <Icon name="user" size={16} />
                <span>Profile</span>
              </Link>
              <div className="admin-dropdown-divider" />
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setDropdownOpen(false);
                  onRequestLogout();
                }}
              >
                <Icon name="logout" size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import ConfirmDialog from './ConfirmDialog';
import { AdminToastProvider } from '../context/AdminToastContext';
import { useAuth } from '../../common/context/AuthContext';
import '../styles/admin.css';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AdminToastProvider>
      <div className={`admin-shell ${collapsed ? 'admin-shell-collapsed' : ''}`}>
        <a className="skip-link" href="#admin-main">
          Skip to main content
        </a>

        {/* Mobile overlay backdrop */}
        {mobileOpen && (
          <div
            className="admin-mobile-backdrop"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <AdminSidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((prev) => !prev)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
          onRequestLogout={() => setShowLogoutConfirm(true)}
        />

        {/* Workspace */}
        <div className="admin-workspace">
          <AdminNavbar
            onToggleMobile={() => setMobileOpen((prev) => !prev)}
            onRequestLogout={() => setShowLogoutConfirm(true)}
          />

          <main id="admin-main" className="admin-main-content">
            <Outlet />
          </main>
        </div>

        {/* Logout Confirmation */}
        <ConfirmDialog
          open={showLogoutConfirm}
          title="Sign Out"
          message="Are you sure you want to sign out of the Campus Transportation Administration Portal?"
          confirmText="Sign Out"
          cancelText="Cancel"
          danger={false}
          onConfirm={handleConfirmLogout}
          onClose={() => setShowLogoutConfirm(false)}
        />
      </div>
    </AdminToastProvider>
  );
}

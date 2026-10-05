import { NavLink } from 'react-router-dom';
import Brand from './Brand';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';
import { getDashboardPath } from '../routes/rolePaths';

export default function Sidebar({ collapsed = false, onToggle, onNavigate, onLogout, mobile = false }) {
  const { user } = useAuth();
  const initials = user.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  return <aside className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}${mobile ? ' sidebar-mobile' : ''}`} aria-label="Application sidebar">
    <div className="sidebar-brand"><Brand compact={collapsed} light /></div>
    <div className="sidebar-section-label">WORKSPACE</div>
    <nav className="sidebar-navigation" aria-label="Workspace navigation"><NavLink title={collapsed ? 'Dashboard' : undefined} to={getDashboardPath(user.role)} onClick={onNavigate} className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}><Icon name="layout" size={20} /><span>Dashboard</span></NavLink></nav>
    {!mobile && <button type="button" className="sidebar-collapse" onClick={onToggle} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed}><Icon name="panel-left" size={18} /><span>Collapse sidebar</span></button>}
    <div className="sidebar-bottom"><div className="sidebar-account"><span className="avatar avatar-dark" aria-hidden="true">{initials}</span><div><strong title={user.name}>{user.name}</strong><span className="role-text">{user.role}</span></div></div><button type="button" className="sidebar-logout" onClick={onLogout} title={collapsed ? 'Sign Out' : undefined}><Icon name="logout" size={18} /><span>Sign Out</span></button></div>
  </aside>;
}

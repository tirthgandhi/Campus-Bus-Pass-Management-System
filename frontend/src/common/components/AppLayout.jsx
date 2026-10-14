import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Modal from './Modal';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import './AppLayout.css';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [dialog, setDialog] = useState(null);
  const requestLogout = () => { setDrawer(false); setDialog('logout'); };
  const confirmLogout = () => { logout(); navigate('/login', { replace: true }); };
  return <div className={`app-layout${collapsed ? ' app-layout-collapsed' : ''}`}>
    <a className="skip-link" href="#app-content">Skip to content</a>
    <div className="desktop-sidebar"><Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} onLogout={requestLogout} /></div>
    <div className="app-workspace"><Navbar onMenu={() => setDrawer(true)} onProfile={() => setDialog('profile')} onLogout={requestLogout} /><main id="app-content" className="app-content"><Outlet /></main><footer className="app-footer">Campus Bus Pass Management System<span>University transportation portal</span></footer></div>
    <Modal open={drawer} title="Navigation" onClose={() => setDrawer(false)} className="drawer-modal"><Sidebar mobile onNavigate={() => setDrawer(false)} onLogout={requestLogout} /></Modal>
    <Modal open={dialog === 'logout'} title="Sign Out" onClose={() => setDialog(null)}><p>Are you sure you want to sign out?</p><div className="modal-actions"><Button variant="secondary" onClick={() => setDialog(null)}>Cancel</Button><Button onClick={confirmLogout}>Sign Out</Button></div></Modal>
    <Modal open={dialog === 'profile'} title="Your profile" onClose={() => setDialog(null)}><dl className="profile-details"><div><dt>Full name</dt><dd>{user.name}</dd></div><div><dt>Email address</dt><dd>{user.email}</dd></div><div><dt>Account role</dt><dd className="role-text">{user.role}</dd></div></dl></Modal>
  </div>;
}

import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onMenu, onProfile, onLogout }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const menu = useRef(null);
  const trigger = useRef(null);
  const initials = user.name.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();
  useEffect(() => {
    const close = (event) => {
      if (event.type === 'keydown') {
        if (event.key === 'Escape') { setOpen(false); if (menu.current?.contains(document.activeElement)) trigger.current?.focus(); }
      } else if (!menu.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, []);
  return <header className="app-navbar"><div className="app-navbar-title"><button type="button" className="icon-button app-menu-toggle" aria-label="Open sidebar" onClick={onMenu}><Icon name="menu" /></button><span>Dashboard</span></div><div className="profile-menu" ref={menu}><button type="button" className="profile-trigger" ref={trigger} aria-expanded={open} aria-controls="profile-options" onClick={() => setOpen(!open)}><span className="avatar" aria-hidden="true">{initials}</span><span className="profile-trigger-copy"><strong>{user.name}</strong><span className="role-text">{user.role}</span></span><Icon name="chevron-down" size={16} /><span className="visually-hidden">Account menu</span></button>{open && <div id="profile-options" className="dropdown"><button type="button" onClick={() => { setOpen(false); trigger.current?.focus(); onProfile(); }}><Icon name="user" size={18} />Profile</button><button type="button" onClick={() => { setOpen(false); trigger.current?.focus(); onLogout(); }}><Icon name="logout" size={18} />Sign Out</button></div>}</div></header>;
}

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Brand from './Brand';
import Icon from './Icon';

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const header = useRef(null);
  useEffect(() => {
    const close = (event) => {
      if (event.type === 'keydown' && event.key !== 'Escape') return;
      if (event.type === 'pointerdown' && header.current?.contains(event.target)) return;
      setRegisterOpen(false);
      setOpen(false);
      if (event.type === 'keydown') {
        const register = header.current?.querySelector('.register-menu > button[aria-expanded="true"]');
        (register || header.current?.querySelector('.public-menu-toggle'))?.focus();
      }
    };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, []);
  const closeMenus = () => { setOpen(false); setRegisterOpen(false); };
  return <header ref={header} className="public-header">
    <div className="container public-nav">
      <Brand />
      <button type="button" className="icon-button public-menu-toggle" aria-label={open ? 'Close navigation' : 'Open navigation'} aria-expanded={open} aria-controls="public-navigation" onClick={() => setOpen(!open)}><Icon name={open ? 'x' : 'menu'} /></button>
      <nav id="public-navigation" className={`public-navigation${open ? ' is-open' : ''}`} aria-label="Main navigation">
        <div className="public-nav-links"><a href="/#home" onClick={closeMenus}>Home</a><a href="/#how-it-works" onClick={closeMenus}>How It Works</a><a href="/#portal" onClick={closeMenus}>Portal</a></div>
        <div className="public-nav-actions"><Link className="nav-login" to="/login" onClick={closeMenus}>Login</Link>
          <div className="register-menu"><button type="button" className="btn btn-primary" aria-expanded={registerOpen} aria-controls="registration-options" onClick={() => setRegisterOpen(!registerOpen)}>Register <Icon name="chevron-down" size={16} /></button>
            {registerOpen && <div id="registration-options" className="dropdown"><Link to="/register/student" onClick={closeMenus}><Icon name="graduation" size={18} />Student</Link><Link to="/register/driver" onClick={closeMenus}><Icon name="bus" size={18} />Driver</Link></div>}
          </div>
        </div>
      </nav>
    </div>
  </header>;
}

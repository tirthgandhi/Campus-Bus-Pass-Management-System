import { Link } from 'react-router-dom';
import Brand from '../components/Brand';
import Icon from '../components/Icon';
import '../../styles/public-theme.css';

export default function AuthLayout({ children, registration = false }) {
  return (
    <main className={`auth-page${registration ? ' auth-page-registration' : ' auth-page-login'}`} id="main-content">
      <aside className="auth-brand-panel" aria-label="Campus transportation">
        <div className="auth-brand-link"><Brand light /></div>
        <div className="auth-brand-content">
          <span className="auth-panel-label">UNIVERSITY TRANSPORTATION</span>
          <h2>Your campus.<br />Better connected.</h2>
          <p>A shared destination. One place for students, drivers, and campus transportation teams.</p>
          <div className="auth-route-art" aria-hidden="true">
            <span className="auth-route-stop" />
            <span className="auth-route-track" />
            <span className="auth-route-bus"><Icon name="bus" size={31} /></span>
            <span className="auth-route-track" />
            <span className="auth-route-campus"><Icon name="building" size={24} /></span>
          </div>
          <div className="auth-panel-caption"><Icon name="shield" size={17} /> Access designed around your role</div>
        </div>
        <p className="auth-panel-footer">Campus Bus Pass Management System</p>
      </aside>

      <section className="auth-form-panel" aria-label={registration ? 'Create your account' : 'Sign in'}>
        <Link className="auth-back-link" to="/"><Icon name="arrow-left" size={17} /> Back to home</Link>
        <div className="auth-mobile-brand"><Brand /></div>
        <div className="auth-form-content">{children}</div>
        <p className="auth-form-footer">University transportation, in one place.</p>
      </section>
    </main>
  );
}

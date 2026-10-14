import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard-page">
      <div className="dashboard-heading">
        <p className="eyebrow">YOUR WORKSPACE</p>
        <h1>Welcome back, {user.name}</h1>
        <p>You are signed in to the Campus Bus Pass Management System.</p>
      </div>
      <section className="workspace-panel" aria-labelledby="workspace-title">
        <div className="workspace-panel-heading">
          <span className="workspace-icon"><Icon name="bus" size={28} /></span>
          <span className="role-badge">{user.role}</span>
        </div>
        <h2 id="workspace-title">Your campus transport workspace</h2>
        <p>Role-specific functionality will be rendered by the corresponding module.</p>
        <div className="workspace-account">
          <Icon name="shield" size={18} />
          <span>Signed in as <strong>{user.email}</strong></span>
        </div>
      </section>

      <p className="dashboard-help">Your account details are available in the profile menu.</p>
    </div>
  );
}

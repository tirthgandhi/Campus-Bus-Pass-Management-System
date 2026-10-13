import Icon from '../../common/components/Icon';

export default function StatCard({ title, value, subtitle, icon = 'layout' }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-content">
        <span className="admin-stat-title">{title}</span>
        <span className="admin-stat-value">{value}</span>
        {subtitle && <span className="admin-stat-subtitle">{subtitle}</span>}
      </div>
      <div className="admin-stat-icon-wrapper" aria-hidden="true">
        <Icon name={icon} size={24} />
      </div>
    </div>
  );
}

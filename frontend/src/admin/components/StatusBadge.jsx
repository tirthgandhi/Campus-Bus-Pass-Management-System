export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toLowerCase();
  let badgeClass = 'admin-badge-active';

  if (['pending', 'maintenance'].includes(normalized)) {
    badgeClass = 'admin-badge-pending';
  } else if (['inactive', 'rejected', 'absent'].includes(normalized)) {
    badgeClass = 'admin-badge-inactive';
  } else if (['active', 'approved', 'present'].includes(normalized)) {
    badgeClass = 'admin-badge-active';
  }

  return (
    <span className={`admin-badge ${badgeClass}`}>
      <span className="admin-badge-dot" aria-hidden="true" />
      {status}
    </span>
  );
}

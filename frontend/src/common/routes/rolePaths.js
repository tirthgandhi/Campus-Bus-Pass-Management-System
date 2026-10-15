export const ROLES = Object.freeze(['student', 'driver', 'admin']);

export function getDashboardPath(role) {
  return ROLES.includes(role) ? `/${role}/dashboard` : '/login';
}

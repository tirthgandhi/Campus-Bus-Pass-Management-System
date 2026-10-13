export const ROLES = Object.freeze(['student', 'driver', 'admin']);

export function getDashboardPath(role) {
  return ROLES.includes(role) ? `/${role}/dashboard` : '/login';
}

// External module URLs for roles that have a dedicated app
export const EXTERNAL_MODULE = Object.freeze({
  student: 'http://localhost:5174',
});

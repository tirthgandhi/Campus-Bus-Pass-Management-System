import api from './api.js';

async function fetchAttendance(path, signal) {
  const response = await api.get(path, { signal });
  if (!Array.isArray(response.data?.data)) {
    const error = new Error('Invalid attendance response.');
    error.code = 'INVALID_ATTENDANCE_RESPONSE';
    throw error;
  }
  return response.data.data;
}

export function getAdminAttendance({ signal } = {}) {
  return fetchAttendance('/admin/attendance', signal);
}

export function summarizeAttendance(records) {
  const present = records.filter((record) => record.status?.toLowerCase() === 'present').length;
  const absent = records.filter((record) => record.status?.toLowerCase() === 'absent').length;
  const total = present + absent;
  return {
    present,
    absent,
    total,
    percentage: total ? Math.round((present / total) * 100) : 0,
  };
}

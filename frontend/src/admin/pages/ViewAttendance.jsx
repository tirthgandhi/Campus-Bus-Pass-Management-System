import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Icon from '../../common/components/Icon';
import { useAdminToast } from '../context/AdminToastContext';
import { attendanceService } from '../services/attendanceService';

export default function ViewAttendance() {
  const { showToast } = useAdminToast();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadAttendance();
  }, [dateFilter]);

  const loadAttendance = async () => {
    try {
      const response = await attendanceService.getAttendance(1, 100, { date: dateFilter });
      setAttendance(response.data || []);
    } catch (err) {
      showToast(`Error loading attendance: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Student', key: 'studentName' },
    { title: 'Bus', key: 'busNumber' },
    { title: 'Check-in Time', key: 'checkInTime' },
    { title: 'Check-out Time', key: 'checkOutTime' },
    { title: 'Status', key: 'status' },
  ];

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>View Attendance</h1>
          <p>Student attendance tracking and reports.</p>
        </div>
      </div>

      <div className="admin-controls-bar">
        <div className="admin-filters-group">
          <input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} />
        </div>
      </div>

      {loading ? <div><p>Loading...</p></div> : <DataTable columns={columns} data={attendance} keyField="_id" emptyMessage="No attendance records found." />}
    </div>
  );
}

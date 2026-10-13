import { useState, useMemo, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Icon from '../../common/components/Icon';
import { getApiError } from '../../common/services/api';
import { getAdminAttendance, summarizeAttendance } from '../../common/services/attendanceService';
import { useAdminToast } from '../context/AdminToastContext';

function todayInCampusTimeZone() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export default function ViewAttendance() {
  const { showToast } = useAdminToast();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reload, setReload] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(todayInCampusTimeZone);
  const [busFilter, setBusFilter] = useState('All');
  const [routeFilter, setRouteFilter] = useState('All');

  useEffect(() => {
    const controller = new AbortController();
    getAdminAttendance({ signal: controller.signal })
      .then(setAttendanceRecords)
      .catch((requestError) => {
        if (!controller.signal.aborted) setError(getApiError(requestError, 'attendance'));
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [reload]);

  const studentSummaries = useMemo(() => {
    const recordsByStudent = new Map();
    attendanceRecords.forEach((record) => {
      const studentId = record.student?._id || record.student;
      if (!studentId) return;
      const entries = recordsByStudent.get(String(studentId)) || [];
      entries.push(record);
      recordsByStudent.set(String(studentId), entries);
    });
    return new Map(
      [...recordsByStudent].map(([studentId, records]) => [
        studentId,
        summarizeAttendance(records).percentage,
      ]),
    );
  }, [attendanceRecords]);

  const availableBuses = useMemo(
    () => [...new Set(attendanceRecords.map((record) => record.bus?.busNumber).filter(Boolean))].sort(),
    [attendanceRecords],
  );
  const availableRoutes = useMemo(
    () => [...new Set(attendanceRecords.map((record) => record.route?.routeName).filter(Boolean))].sort(),
    [attendanceRecords],
  );

  // Stats
  const todayPresent = attendanceRecords.filter(
    (record) => String(record.date).slice(0, 10) === todayInCampusTimeZone()
      && record.status?.toLowerCase() === 'present',
  ).length;

  const totalToday = attendanceRecords.filter(
    (record) => String(record.date).slice(0, 10) === todayInCampusTimeZone(),
  ).length;
  const rate = totalToday > 0 ? Math.round((todayPresent / totalToday) * 100) : 0;

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((record) => {
      const student = record.student && typeof record.student === 'object' ? record.student : {};
      const bus = record.bus && typeof record.bus === 'object' ? record.bus : {};
      const route = record.route && typeof record.route === 'object' ? record.route : {};
      const driver = record.driver && typeof record.driver === 'object' ? record.driver : {};
      const normalized = {
        id: record._id,
        student: student.name || 'Unknown student',
        enrollmentNumber: student.studentId || 'N/A',
        studentKey: String(student._id || record.student || ''),
        busPassId: record.busPassId || 'N/A',
        bus: bus.busNumber || 'N/A',
        route: route.routeName || 'N/A',
        driver: driver.name || 'N/A',
        date: String(record.date).slice(0, 10),
        status: record.status ? record.status.charAt(0).toUpperCase() + record.status.slice(1) : 'Unknown',
        attendanceRate: studentSummaries.get(String(student._id || record.student || '')) ?? 0,
      };
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        normalized.student.toLowerCase().includes(q) ||
        normalized.enrollmentNumber.toLowerCase().includes(q) ||
        normalized.busPassId.toLowerCase().includes(q) ||
        normalized.driver.toLowerCase().includes(q);

      const matchesDate = !dateFilter || normalized.date === dateFilter;
      const matchesBus = busFilter === 'All' || normalized.bus === busFilter;
      const matchesRoute = routeFilter === 'All' || normalized.route === routeFilter;

      return matchesSearch && matchesDate && matchesBus && matchesRoute ? normalized : false;
    });
  }, [attendanceRecords, studentSummaries, searchQuery, dateFilter, busFilter, routeFilter]);

  const handleDownloadReport = async () => {
    try {
      const { downloadAttendanceReport } = await import('../../common/services/attendanceReport');
      downloadAttendanceReport(filteredRecords, {
        date: dateFilter || 'All dates',
        bus: busFilter,
        route: routeFilter,
      });
      showToast('Attendance report downloaded.', 'success');
    } catch {
      showToast('The attendance report could not be generated. Please try again.', 'error');
    }
  };

  const columns = [
    {
      title: 'Student',
      key: 'student',
      render: (val, row) => (
        <div>
          <strong>{val}</strong>
          <div style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
            {row.enrollmentNumber}
          </div>
        </div>
      ),
    },
    {
      title: 'Bus Pass ID',
      key: 'busPassId',
      render: (val) => <code>{val}</code>,
    },
    { title: 'Bus', key: 'bus' },
    { title: 'Route', key: 'route' },
    { title: 'Driver', key: 'driver' },
    { title: 'Date', key: 'date' },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Attendance',
      key: 'attendanceRate',
      render: (val) => <strong>{val}%</strong>,
    },
  ];

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Attendance</h1>
          <p>Daily student boarding logs and transit verification.</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleDownloadReport}
            disabled={loading || Boolean(error) || filteredRecords.length === 0}
          >
            <Icon name="download" size={16} />
            Download PDF Report
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="admin-stat-grid">
        <StatCard
          title="Today's Present Students"
          value={todayPresent}
          subtitle="Boarded buses today"
          icon="clipboard-check"
        />
        <StatCard
          title="Total Records"
          value={attendanceRecords.length}
          subtitle="Historical boarding logs"
          icon="file-text"
        />
        <StatCard
          title="Attendance Rate"
          value={`${rate}%`}
          subtitle="Today's turnout ratio"
          icon="users"
        />
      </div>

      {error && (
        <div className="admin-card" role="alert" style={{ marginBottom: '20px' }}>
          <p>{error}</p>
          <button
            type="button"
            className="admin-btn admin-btn-secondary admin-btn-sm"
            onClick={() => {
              setLoading(true);
              setError('');
              setReload((value) => value + 1);
            }}
          >
            Try again
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="admin-controls-bar">
        <div className="admin-filters-group">
          <div className="admin-search-input-wrap">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search Student, Pass ID, Driver..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search attendance"
            />
          </div>

          <input
            type="date"
            className="admin-form-input"
            style={{ width: 'auto', height: '40px', padding: '0 12px' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter by date"
          />

          <select
            className="admin-filter-select"
            value={busFilter}
            onChange={(e) => setBusFilter(e.target.value)}
            aria-label="Filter by bus"
          >
            <option value="All">All Buses</option>
            {availableBuses.map((bus) => (
              <option key={bus} value={bus}>
                {bus}
              </option>
            ))}
          </select>

          <select
            className="admin-filter-select"
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            aria-label="Filter by route"
          >
            <option value="All">All Routes</option>
            {availableRoutes.map((route) => (
              <option key={route} value={route}>
                {route}
              </option>
            ))}
          </select>

          {dateFilter && (
            <button
              type="button"
              className="admin-btn admin-btn-secondary admin-btn-sm"
              onClick={() => setDateFilter('')}
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p className="admin-card" role="status">Loading attendance records...</p>
      ) : !error && (
        <DataTable
          columns={columns}
          data={filteredRecords}
          keyField="id"
          emptyMessage="No attendance records found."
          emptySubtitle="Try selecting another date or adjusting your filters."
        />
      )}
    </div>
  );
}

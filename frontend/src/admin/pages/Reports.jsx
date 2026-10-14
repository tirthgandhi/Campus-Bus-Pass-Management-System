import { useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import Icon from '../../common/components/Icon';
import { initialBuses, initialRoutes } from '../data/adminMockData';
import { useAdminToast } from '../context/AdminToastContext';

export default function Reports() {
  const { showToast } = useAdminToast();

  // Filter state
  const [reportType, setReportType] = useState('Monthly');
  const [selectedPeriod, setSelectedPeriod] = useState('2026-10');
  const [selectedBus, setSelectedBus] = useState('All');
  const [selectedRoute, setSelectedRoute] = useState('All');

  // Generated Report state
  const [reportGenerated, setReportGenerated] = useState(true);
  const [activeReportMeta, setActiveReportMeta] = useState({
    type: 'Monthly',
    period: 'October 2026',
    generatedAt: '11 Oct 2026, 03:30 PM',
  });

  const handleGenerateReport = (e) => {
    e.preventDefault();
    setReportGenerated(true);
    setActiveReportMeta({
      type: reportType,
      period:
        reportType === 'Daily'
          ? selectedPeriod || 'Today'
          : reportType === 'Monthly'
          ? 'October 2026'
          : 'Academic Year 2026-27',
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
    showToast('Report generated successfully.', 'success');
  };

  const routeSummaryData = [
    {
      id: 'REP-01',
      route: 'North Campus Express',
      bus: 'Bus 101',
      totalPasses: 46,
      capacity: 48,
      utilization: '95.8%',
      avgAttendance: '92.4%',
    },
    {
      id: 'REP-02',
      route: 'South Metro Link',
      bus: 'Bus 102',
      totalPasses: 43,
      capacity: 45,
      utilization: '95.5%',
      avgAttendance: '88.6%',
    },
    {
      id: 'REP-03',
      route: 'West Suburbs Connector',
      bus: 'Bus 103',
      totalPasses: 49,
      capacity: 52,
      utilization: '94.2%',
      avgAttendance: '91.0%',
    },
    {
      id: 'REP-04',
      route: 'East City Line',
      bus: 'Bus 104',
      totalPasses: 44,
      capacity: 48,
      utilization: '91.6%',
      avgAttendance: '86.5%',
    },
    {
      id: 'REP-05',
      route: 'Central Ring Shuttle',
      bus: 'Bus 106',
      totalPasses: 38,
      capacity: 50,
      utilization: '76.0%',
      avgAttendance: '79.2%',
    },
  ];

  const filteredRouteSummary = routeSummaryData.filter((r) => {
    const matchBus = selectedBus === 'All' || r.bus === selectedBus;
    const matchRoute = selectedRoute === 'All' || r.route === selectedRoute;
    return matchBus && matchRoute;
  });

  const columns = [
    {
      title: 'Transit Route',
      key: 'route',
      render: (val) => <strong>{val}</strong>,
    },
    { title: 'Allocated Bus', key: 'bus' },
    {
      title: 'Pass Holders',
      key: 'totalPasses',
      render: (val, row) => `${val} / ${row.capacity} seats`,
    },
    {
      title: 'Seat Utilization',
      key: 'utilization',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--admin-blue-deep)' }}>
          {val}
        </span>
      ),
    },
    {
      title: 'Avg. Attendance Turnout',
      key: 'avgAttendance',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--admin-success)' }}>
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Reports</h1>
          <p>Fleet utilization, route capacities, and passenger transit analytics.</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            title="Download report export placeholder"
            onClick={() => showToast('Export download is a UI demonstration placeholder.', 'warning')}
          >
            <Icon name="download" size={16} />
            Export Summary (UI Placeholder)
          </button>
        </div>
      </div>

      {/* Filter / Generator Form */}
      <div className="admin-card" style={{ marginBottom: '24px' }}>
        <form onSubmit={handleGenerateReport}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              alignItems: 'end',
            }}
          >
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label">Report Type</label>
              <select
                className="admin-form-select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="Daily">Daily Report</option>
                <option value="Monthly">Monthly Report</option>
                <option value="Yearly">Yearly Report</option>
              </select>
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label">
                {reportType === 'Daily'
                  ? 'Select Date'
                  : reportType === 'Monthly'
                  ? 'Select Month'
                  : 'Select Academic Year'}
              </label>
              {reportType === 'Daily' ? (
                <input
                  type="date"
                  className="admin-form-input"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                />
              ) : reportType === 'Monthly' ? (
                <input
                  type="month"
                  className="admin-form-input"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                />
              ) : (
                <select
                  className="admin-form-select"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="2026-27">2026 - 2027</option>
                  <option value="2025-26">2025 - 2026</option>
                </select>
              )}
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label">Filter Bus (Optional)</label>
              <select
                className="admin-form-select"
                value={selectedBus}
                onChange={(e) => setSelectedBus(e.target.value)}
              >
                <option value="All">All Buses</option>
                {initialBuses.map((b) => (
                  <option key={b.id} value={b.busNumber}>
                    {b.busNumber}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group" style={{ margin: 0 }}>
              <label className="admin-form-label">Filter Route (Optional)</label>
              <select
                className="admin-form-select"
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
              >
                <option value="All">All Routes</option>
                {initialRoutes.map((r) => (
                  <option key={r.id} value={r.routeName}>
                    {r.routeName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
                style={{ width: '100%', height: '40px' }}
              >
                <Icon name="file-text" size={16} />
                Generate Report
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Generated Report Content */}
      {reportGenerated && (
        <>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--admin-navy-darkest)' }}>
                {activeReportMeta.type} Transportation Summary ({activeReportMeta.period})
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--admin-text-secondary)' }}>
                Report calculated as of {activeReportMeta.generatedAt}
              </span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="admin-stat-grid">
            <StatCard
              title="Students Assigned"
              value="220"
              subtitle="Active pass subscriptions"
              icon="graduation"
            />
            <StatCard
              title="Active Buses"
              value="17 / 22"
              subtitle="Daily deployed fleet"
              icon="bus"
            />
            <StatCard
              title="Routes Operating"
              value="14"
              subtitle="Scheduled university routes"
              icon="route"
            />
            <StatCard
              title="Attendance Turnout"
              value="89.5%"
              subtitle="Average monthly turnout"
              icon="clipboard-check"
            />
          </div>

          {/* Breakdown Table */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Route & Vehicle Performance Breakdown</h2>
              <span className="admin-card-badge">Fleet Performance</span>
            </div>
            <DataTable
              columns={columns}
              data={filteredRouteSummary}
              keyField="id"
              emptyMessage="No route summary records found for selected filters."
            />
          </div>
        </>
      )}
    </div>
  );
}

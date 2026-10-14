import { useState } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AdminModal from '../components/AdminModal';
import Icon from '../../common/components/Icon';
import { dashboardOverview, initialRequests } from '../data/adminMockData';

export default function AdminDashboard() {
  const [selectedRequest, setSelectedRequest] = useState(null);

  const columns = [
    { title: 'Student', key: 'student', render: (val) => <strong>{val}</strong> },
    { title: 'Enrollment No', key: 'enrollmentNumber' },
    { title: 'Pickup Point', key: 'pickupPoint' },
    { title: 'Request Date', key: 'requestDate' },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, row) => (
        <button
          type="button"
          className="admin-btn admin-btn-secondary admin-btn-sm"
          onClick={() => setSelectedRequest(row)}
        >
          <Icon name="eye" size={14} />
          View
        </button>
      ),
    },
  ];

  const busAvail = dashboardOverview.busAvailability;
  const activePct = Math.round((busAvail.active / busAvail.total) * 100);
  const maintPct = Math.round((busAvail.maintenance / busAvail.total) * 100);
  const inactPct = Math.round((busAvail.inactive / busAvail.total) * 100);

  return (
    <div className="admin-page-container">
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Welcome back, Admin</h1>
          <p>Manage campus transportation operations from one place.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="admin-stat-grid">
        <StatCard
          title="Total Students"
          value={dashboardOverview.totalStudents}
          subtitle="Registered across all branches"
          icon="graduation"
        />
        <StatCard
          title="Total Drivers"
          value={dashboardOverview.totalDrivers}
          subtitle="Licensed active personnel"
          icon="user"
        />
        <StatCard
          title="Total Buses"
          value={dashboardOverview.totalBuses}
          subtitle="University transport fleet"
          icon="bus"
        />
        <StatCard
          title="Active Routes"
          value={dashboardOverview.activeRoutes}
          subtitle="Daily operating paths"
          icon="route"
        />
      </div>

      {/* Second Section: Recent Transport Requests */}
      <div className="admin-card" style={{ marginBottom: '28px' }}>
        <div className="admin-card-header">
          <h2 className="admin-card-title">Recent Transport Requests</h2>
          <span className="admin-card-badge">Latest submissions</span>
        </div>
        <DataTable
          columns={columns}
          data={initialRequests.slice(0, 5)}
          keyField="id"
          emptyMessage="No recent transport requests."
        />
      </div>

      {/* Third Section: Bus Availability & Route Overview */}
      <div className="admin-dashboard-two-col">
        {/* Bus Availability Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Bus Availability</h2>
            <span className="admin-card-badge">{busAvail.total} Total Vehicles</span>
          </div>
          <div className="admin-metric-row">
            <div className="admin-metric-label-val">
              <span>Active on Route</span>
              <span>{busAvail.active} Buses ({activePct}%)</span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill admin-progress-navy"
                style={{ width: `${activePct}%` }}
              />
            </div>
          </div>
          <div className="admin-metric-row">
            <div className="admin-metric-label-val">
              <span>Under Scheduled Maintenance</span>
              <span>{busAvail.maintenance} Buses ({maintPct}%)</span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill admin-progress-medium"
                style={{ width: `${maintPct}%` }}
              />
            </div>
          </div>
          <div className="admin-metric-row">
            <div className="admin-metric-label-val">
              <span>Reserve / Inactive</span>
              <span>{busAvail.inactive} Buses ({inactPct}%)</span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill admin-progress-muted"
                style={{ width: `${inactPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Route Overview Card */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Route Overview</h2>
            <span className="admin-card-badge">Transit Network</span>
          </div>
          <div className="admin-metric-row">
            <div className="admin-metric-label-val">
              <span>Operational Routes</span>
              <span>{dashboardOverview.routeOverview.activeRoutes} Routes</span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill admin-progress-navy"
                style={{ width: '85%' }}
              />
            </div>
          </div>
          <div className="admin-metric-row">
            <div className="admin-metric-label-val">
              <span>Designated Pickup Points</span>
              <span>{dashboardOverview.routeOverview.pickupPoints} Stops</span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill admin-progress-medium"
                style={{ width: '70%' }}
              />
            </div>
          </div>
          <div className="admin-metric-row">
            <div className="admin-metric-label-val">
              <span>Total Fleet Seating Capacity</span>
              <span>{dashboardOverview.routeOverview.totalCapacity} Seats</span>
            </div>
            <div className="admin-progress-track">
              <div
                className="admin-progress-fill admin-progress-light"
                style={{ width: '92%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* View Request Modal */}
      {selectedRequest && (
        <AdminModal
          open={Boolean(selectedRequest)}
          title="Transport Request Details"
          onClose={() => setSelectedRequest(null)}
          size="md"
          footer={
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setSelectedRequest(null)}
            >
              Close
            </button>
          }
        >
          <dl className="admin-info-dl">
            <dt className="admin-info-dt">Request ID:</dt>
            <dd className="admin-info-dd"><code>{selectedRequest.id}</code></dd>

            <dt className="admin-info-dt">Student Name:</dt>
            <dd className="admin-info-dd"><strong>{selectedRequest.student}</strong></dd>

            <dt className="admin-info-dt">Enrollment No:</dt>
            <dd className="admin-info-dd">{selectedRequest.enrollmentNumber}</dd>

            <dt className="admin-info-dt">Department:</dt>
            <dd className="admin-info-dd">{selectedRequest.department}</dd>

            <dt className="admin-info-dt">College Email:</dt>
            <dd className="admin-info-dd">{selectedRequest.email}</dd>

            <dt className="admin-info-dt">Contact Phone:</dt>
            <dd className="admin-info-dd">{selectedRequest.phone}</dd>

            <dt className="admin-info-dt">Pickup Stop:</dt>
            <dd className="admin-info-dd">{selectedRequest.pickupPoint}</dd>

            <dt className="admin-info-dt">Application Date:</dt>
            <dd className="admin-info-dd">{selectedRequest.requestDate}</dd>

            <dt className="admin-info-dt">Current Status:</dt>
            <dd className="admin-info-dd">
              <StatusBadge status={selectedRequest.status} />
            </dd>

            {selectedRequest.busPassId && (
              <>
                <dt className="admin-info-dt">Assigned Pass ID:</dt>
                <dd className="admin-info-dd"><strong>{selectedRequest.busPassId}</strong></dd>
              </>
            )}

            {selectedRequest.rejectionReason && (
              <>
                <dt className="admin-info-dt">Reason:</dt>
                <dd className="admin-info-dd" style={{ color: 'var(--admin-danger)' }}>
                  {selectedRequest.rejectionReason}
                </dd>
              </>
            )}
          </dl>
        </AdminModal>
      )}
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AdminModal from '../components/AdminModal';
import Icon from '../../common/components/Icon';
import { useAdminToast } from '../context/AdminToastContext';
import { requestService } from '../services/requestService';
import { busService } from '../services/busService';
import { routeService } from '../services/routeService';
import { pickupPointService } from '../services/pickupPointService';

export default function ManageRequests() {
  const { showToast } = useAdminToast();
  const [requests, setRequests] = useState([]);
  const [buses, setBuses] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');

  // Modals state
  const [viewingRequest, setViewingRequest] = useState(null);
  const [rejectingRequest, setRejectingRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState('');

  // Approve / Assignment Modal state
  const [approvingRequest, setApprovingRequest] = useState(null);
  const [approvalData, setApprovalData] = useState({
    bus: initialBuses[0]?.busNumber || '',
    route: initialRoutes[0]?.routeName || '',
    pickupPoint: initialPickupPoints[0]?.pickupPoint || '',
  });

  // Stat counts
  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'Rejected').length;

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        req.student.toLowerCase().includes(q) ||
        req.enrollmentNumber.toLowerCase().includes(q) ||
        req.id.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      const matchesDate = !dateFilter || req.requestDate === dateFilter;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [requests, searchQuery, statusFilter, dateFilter]);

  // Handle open Reject Modal
  const handleOpenReject = (req) => {
    setRejectingRequest(req);
    setRejectionReason('');
    setRejectionError('');
  };

  const handleConfirmReject = (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setRejectionError('Rejection reason is mandatory before submitting.');
      return;
    }

    setRequests((prev) =>
      prev.map((r) =>
        r.id === rejectingRequest.id
          ? {
              ...r,
              status: 'Rejected',
              rejectionReason: rejectionReason.trim(),
            }
          : r
      )
    );

    showToast('Request rejected.', 'error');
    setRejectingRequest(null);
    if (viewingRequest?.id === rejectingRequest.id) {
      setViewingRequest(null);
    }
  };

  // Handle open Approve Modal
  const handleOpenApprove = (req) => {
    setApprovingRequest(req);
    setApprovalData({
      bus: initialBuses[0]?.busNumber || 'Bus 101',
      route: initialRoutes[0]?.routeName || 'North Campus Express',
      pickupPoint: req.pickupPoint || initialPickupPoints[0]?.pickupPoint,
    });
  };

  // Generate Bus Pass ID preview
  const generatedPassId = useMemo(() => {
    if (!approvingRequest) return '';
    const code =
      approvingRequest.enrollmentNumber.replace(/\D/g, '').slice(-3) || '001';
    return `CAMP-PASS-${code}`;
  }, [approvingRequest]);

  const handleConfirmApprove = () => {
    if (!approvingRequest) return;

    setRequests((prev) =>
      prev.map((r) =>
        r.id === approvingRequest.id
          ? {
              ...r,
              status: 'Approved',
              busPassId: generatedPassId,
              pickupPoint: approvalData.pickupPoint,
            }
          : r
      )
    );

    showToast('Request approved.', 'success');
    setApprovingRequest(null);
    if (viewingRequest?.id === approvingRequest.id) {
      setViewingRequest(null);
    }
  };

  const columns = [
    {
      title: 'Request ID',
      key: 'id',
      render: (val) => <code>{val}</code>,
    },
    {
      title: 'Student',
      key: 'student',
      render: (val) => <strong>{val}</strong>,
    },
    { title: 'Enrollment Number', key: 'enrollmentNumber' },
    { title: 'Pickup Point', key: 'pickupPoint' },
    { title: 'Request Date', key: 'requestDate' },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, req) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className="admin-action-btn"
            title="View Details"
            onClick={() => setViewingRequest(req)}
            aria-label={`View details of ${req.id}`}
          >
            <Icon name="eye" size={15} />
          </button>
          {req.status === 'Pending' && (
            <>
              <button
                type="button"
                className="admin-action-btn admin-action-btn-approve"
                title="Approve Request"
                onClick={() => handleOpenApprove(req)}
                aria-label={`Approve request ${req.id}`}
              >
                <Icon name="check" size={15} />
              </button>
              <button
                type="button"
                className="admin-action-btn admin-action-btn-danger"
                title="Reject Request"
                onClick={() => handleOpenReject(req)}
                aria-label={`Reject request ${req.id}`}
              >
                <Icon name="x" size={15} />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Transport Requests</h1>
          <p>Review student bus pass applications, approvals, and boarding seat assignments.</p>
        </div>
      </div>

      {/* Cards */}
      <div className="admin-stat-grid">
        <StatCard
          title="Pending Requests"
          value={pendingCount}
          subtitle="Awaiting administrative review"
          icon="clock"
        />
        <StatCard
          title="Approved Requests"
          value={approvedCount}
          subtitle="Verified and pass issued"
          icon="check-circle"
        />
        <StatCard
          title="Rejected Requests"
          value={rejectedCount}
          subtitle="Non-compliant applications"
          icon="x-circle"
        />
      </div>

      {/* Filters Bar */}
      <div className="admin-controls-bar">
        <div className="admin-filters-group">
          <div className="admin-search-input-wrap">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search Student, Enrollment No, Req ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search requests"
            />
          </div>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>

          <input
            type="date"
            className="admin-form-input"
            style={{ width: 'auto', height: '40px', padding: '0 12px' }}
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            aria-label="Filter by application date"
          />

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
      <DataTable
        columns={columns}
        data={filteredRequests}
        keyField="id"
        emptyMessage="No transport requests found."
        emptySubtitle="Try adjusting your filter or search criteria."
      />

      {/* Request Details Modal */}
      {viewingRequest && (
        <AdminModal
          open={Boolean(viewingRequest)}
          title="Transport Application Details"
          onClose={() => setViewingRequest(null)}
          size="md"
          footer={
            <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'space-between' }}>
              <div>
                {viewingRequest.status === 'Pending' && (
                  <>
                    <button
                      type="button"
                      className="admin-btn admin-btn-danger"
                      onClick={() => handleOpenReject(viewingRequest)}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="admin-btn admin-btn-primary"
                      style={{ marginLeft: '10px' }}
                      onClick={() => handleOpenApprove(viewingRequest)}
                    >
                      Approve & Assign
                    </button>
                  </>
                )}
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setViewingRequest(null)}
              >
                Close
              </button>
            </div>
          }
        >
          <dl className="admin-info-dl">
            <dt className="admin-info-dt">Request ID:</dt>
            <dd className="admin-info-dd"><code>{viewingRequest.id}</code></dd>

            <dt className="admin-info-dt">Student Name:</dt>
            <dd className="admin-info-dd"><strong>{viewingRequest.student}</strong></dd>

            <dt className="admin-info-dt">Enrollment No:</dt>
            <dd className="admin-info-dd">{viewingRequest.enrollmentNumber}</dd>

            <dt className="admin-info-dt">Department:</dt>
            <dd className="admin-info-dd">{viewingRequest.department}</dd>

            <dt className="admin-info-dt">College Email:</dt>
            <dd className="admin-info-dd">{viewingRequest.email}</dd>

            <dt className="admin-info-dt">Contact Phone:</dt>
            <dd className="admin-info-dd">{viewingRequest.phone}</dd>

            <dt className="admin-info-dt">Selected Pickup Point:</dt>
            <dd className="admin-info-dd">{viewingRequest.pickupPoint}</dd>

            <dt className="admin-info-dt">Request Date:</dt>
            <dd className="admin-info-dd">{viewingRequest.requestDate}</dd>

            <dt className="admin-info-dt">Current Status:</dt>
            <dd className="admin-info-dd">
              <StatusBadge status={viewingRequest.status} />
            </dd>

            {viewingRequest.busPassId && (
              <>
                <dt className="admin-info-dt">Issued Bus Pass ID:</dt>
                <dd className="admin-info-dd"><strong>{viewingRequest.busPassId}</strong></dd>
              </>
            )}

            {viewingRequest.rejectionReason && (
              <>
                <dt className="admin-info-dt">Rejection Reason:</dt>
                <dd className="admin-info-dd" style={{ color: 'var(--admin-danger)' }}>
                  {viewingRequest.rejectionReason}
                </dd>
              </>
            )}
          </dl>
        </AdminModal>
      )}

      {/* Reject Request Modal */}
      {rejectingRequest && (
        <AdminModal
          open={Boolean(rejectingRequest)}
          title="Reject Transport Request"
          onClose={() => setRejectingRequest(null)}
          size="sm"
          footer={
            <>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setRejectingRequest(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-danger"
                onClick={handleConfirmReject}
              >
                Reject Request
              </button>
            </>
          }
        >
          <form noValidate onSubmit={handleConfirmReject}>
            <p style={{ margin: '0 0 16px', fontSize: '14px', color: 'var(--admin-text-main)' }}>
              Rejecting bus pass application for <strong>{rejectingRequest.student}</strong> (
              {rejectingRequest.enrollmentNumber}).
            </p>
            <div className="admin-form-group">
              <label className="admin-form-label">
                Rejection Reason <span className="required">*</span>
              </label>
              <textarea
                rows="3"
                className={`admin-form-textarea ${rejectionError ? 'is-invalid' : ''}`}
                placeholder="Specify administrative reason (e.g. invalid stop, capacity full)..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  setRejectionError('');
                }}
              />
              {rejectionError && (
                <span className="admin-form-error">{rejectionError}</span>
              )}
            </div>
          </form>
        </AdminModal>
      )}

      {/* Approve Request UI (Assignment Modal) */}
      {approvingRequest && (
        <AdminModal
          open={Boolean(approvingRequest)}
          title="Approve Request & Issue Pass"
          onClose={() => setApprovingRequest(null)}
          size="md"
          footer={
            <>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setApprovingRequest(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleConfirmApprove}
              >
                Approve & Assign
              </button>
            </>
          }
        >
          <div>
            <div
              style={{
                backgroundColor: 'var(--admin-blue-bg)',
                border: '1px solid var(--admin-border)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--admin-blue-deep)', textTransform: 'uppercase' }}>
                    Generated Bus Pass ID Preview
                  </span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--admin-navy-darkest)', marginTop: '4px' }}>
                    <code>{generatedPassId}</code>
                  </div>
                </div>
                <Icon name="id-card" size={32} style={{ color: 'var(--admin-blue-medium)' }} />
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Student</label>
              <input
                type="text"
                className="admin-form-input"
                disabled
                value={`${approvingRequest.student} (${approvingRequest.enrollmentNumber})`}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Select Bus</label>
                <select
                  className="admin-form-select"
                  value={approvalData.bus}
                  onChange={(e) =>
                    setApprovalData({ ...approvalData, bus: e.target.value })
                  }
                >
                  {initialBuses.map((b) => (
                    <option key={b.id} value={b.busNumber}>
                      {b.busNumber} ({b.capacity} seats - {b.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Select Route</label>
                <select
                  className="admin-form-select"
                  value={approvalData.route}
                  onChange={(e) =>
                    setApprovalData({ ...approvalData, route: e.target.value })
                  }
                >
                  {initialRoutes.map((r) => (
                    <option key={r.id} value={r.routeName}>
                      {r.routeName} ({r.routeCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Pickup Point</label>
              <select
                className="admin-form-select"
                value={approvalData.pickupPoint}
                onChange={(e) =>
                  setApprovalData({
                    ...approvalData,
                    pickupPoint: e.target.value,
                  })
                }
              >
                {initialPickupPoints.map((p) => (
                  <option key={p.id} value={p.pickupPoint}>
                    {p.pickupPoint} ({p.route})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}

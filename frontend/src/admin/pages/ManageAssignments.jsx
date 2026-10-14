import { useState, useMemo } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AdminModal from '../components/AdminModal';
import Icon from '../../common/components/Icon';
import {
  initialAssignments,
  initialBuses,
  initialRoutes,
  initialPickupPoints,
} from '../data/adminMockData';
import { useAdminToast } from '../context/AdminToastContext';

export default function ManageAssignments() {
  const { showToast } = useAdminToast();
  const [assignments, setAssignments] = useState(initialAssignments);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [busFilter, setBusFilter] = useState('All');
  const [routeFilter, setRouteFilter] = useState('All');

  // Modals
  const [viewingAssignment, setViewingAssignment] = useState(null);
  const [editingAssignment, setEditingAssignment] = useState(null);

  // Edit Form State
  const [editFormData, setEditFormData] = useState({
    bus: '',
    route: '',
    pickupPoint: '',
    status: 'Active',
  });

  const totalCount = assignments.length;
  const activeCount = assignments.filter((a) => a.status === 'Active').length;

  const filteredAssignments = useMemo(() => {
    return assignments.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.student.toLowerCase().includes(q) ||
        item.enrollmentNumber.toLowerCase().includes(q) ||
        item.busPassId.toLowerCase().includes(q);

      const matchesBus = busFilter === 'All' || item.bus === busFilter;
      const matchesRoute = routeFilter === 'All' || item.route === routeFilter;

      return matchesSearch && matchesBus && matchesRoute;
    });
  }, [assignments, searchQuery, busFilter, routeFilter]);

  const handleOpenEdit = (assignment) => {
    setEditingAssignment(assignment);
    setEditFormData({
      bus: assignment.bus,
      route: assignment.route,
      pickupPoint: assignment.pickupPoint,
      status: assignment.status,
    });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === editingAssignment.id ? { ...a, ...editFormData } : a
      )
    );
    showToast('Assignment updated successfully.', 'success');
    setEditingAssignment(null);
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
    { title: 'Pickup Point', key: 'pickupPoint' },
    { title: 'Assigned Date', key: 'assignedDate' },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, assignment) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className="admin-action-btn"
            title="View Details"
            onClick={() => setViewingAssignment(assignment)}
            aria-label={`View details of ${assignment.student}`}
          >
            <Icon name="eye" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn"
            title="Edit Assignment"
            onClick={() => handleOpenEdit(assignment)}
            aria-label={`Edit assignment for ${assignment.student}`}
          >
            <Icon name="edit" size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Bus Assignments</h1>
          <p>Active student bus passes and chartered route seat allocations.</p>
        </div>
      </div>

      {/* Cards */}
      <div className="admin-stat-grid">
        <StatCard
          title="Total Assignments"
          value={totalCount}
          subtitle="All recorded pass issuances"
          icon="id-card"
        />
        <StatCard
          title="Active Assignments"
          value={activeCount}
          subtitle="Currently active transit passes"
          icon="check-circle"
        />
      </div>

      {/* Controls Bar */}
      <div className="admin-controls-bar">
        <div className="admin-filters-group">
          <div className="admin-search-input-wrap">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search Student, Pass ID, Enrollment No..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search assignments"
            />
          </div>

          <select
            className="admin-filter-select"
            value={busFilter}
            onChange={(e) => setBusFilter(e.target.value)}
            aria-label="Filter by bus"
          >
            <option value="All">All Buses</option>
            {initialBuses.map((b) => (
              <option key={b.id} value={b.busNumber}>
                {b.busNumber}
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
            {initialRoutes.map((r) => (
              <option key={r.id} value={r.routeName}>
                {r.routeName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredAssignments}
        keyField="id"
        emptyMessage="No bus assignments found."
        emptySubtitle="Try adjusting your filter options."
      />

      {/* View Assignment Modal */}
      {viewingAssignment && (
        <AdminModal
          open={Boolean(viewingAssignment)}
          title="Bus Pass Assignment Record"
          onClose={() => setViewingAssignment(null)}
          size="md"
          footer={
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setViewingAssignment(null)}
            >
              Close
            </button>
          }
        >
          <dl className="admin-info-dl">
            <dt className="admin-info-dt">Student Name:</dt>
            <dd className="admin-info-dd"><strong>{viewingAssignment.student}</strong></dd>

            <dt className="admin-info-dt">Enrollment No:</dt>
            <dd className="admin-info-dd">{viewingAssignment.enrollmentNumber}</dd>

            <dt className="admin-info-dt">Issued Pass ID:</dt>
            <dd className="admin-info-dd"><code>{viewingAssignment.busPassId}</code></dd>

            <dt className="admin-info-dt">Allocated Vehicle:</dt>
            <dd className="admin-info-dd">{viewingAssignment.bus}</dd>

            <dt className="admin-info-dt">Chartered Route:</dt>
            <dd className="admin-info-dd">{viewingAssignment.route}</dd>

            <dt className="admin-info-dt">Pickup Stop:</dt>
            <dd className="admin-info-dd">{viewingAssignment.pickupPoint}</dd>

            <dt className="admin-info-dt">Effective Date:</dt>
            <dd className="admin-info-dd">{viewingAssignment.assignedDate}</dd>

            <dt className="admin-info-dt">Pass Status:</dt>
            <dd className="admin-info-dd">
              <StatusBadge status={viewingAssignment.status} />
            </dd>
          </dl>
        </AdminModal>
      )}

      {/* Edit Assignment Modal */}
      {editingAssignment && (
        <AdminModal
          open={Boolean(editingAssignment)}
          title="Edit Bus Assignment"
          onClose={() => setEditingAssignment(null)}
          size="md"
          footer={
            <>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setEditingAssignment(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </>
          }
        >
          <form noValidate onSubmit={handleSaveEdit}>
            <div className="admin-form-group">
              <label className="admin-form-label">Student Details</label>
              <input
                type="text"
                className="admin-form-input"
                disabled
                value={`${editingAssignment.student} (${editingAssignment.enrollmentNumber})`}
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Bus Pass ID</label>
              <input
                type="text"
                className="admin-form-input"
                disabled
                value={editingAssignment.busPassId}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Bus</label>
                <select
                  className="admin-form-select"
                  value={editFormData.bus}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, bus: e.target.value })
                  }
                >
                  {initialBuses.map((b) => (
                    <option key={b.id} value={b.busNumber}>
                      {b.busNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Route</label>
                <select
                  className="admin-form-select"
                  value={editFormData.route}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, route: e.target.value })
                  }
                >
                  {initialRoutes.map((r) => (
                    <option key={r.id} value={r.routeName}>
                      {r.routeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">Pickup Point</label>
                <select
                  className="admin-form-select"
                  value={editFormData.pickupPoint}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      pickupPoint: e.target.value,
                    })
                  }
                >
                  {initialPickupPoints.map((p) => (
                    <option key={p.id} value={p.pickupPoint}>
                      {p.pickupPoint}
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">Status</label>
                <select
                  className="admin-form-select"
                  value={editFormData.status}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, status: e.target.value })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </form>
        </AdminModal>
      )}
    </div>
  );
}

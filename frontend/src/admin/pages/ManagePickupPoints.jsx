import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../../common/components/Icon';
import { initialPickupPoints, initialRoutes } from '../data/adminMockData';
import { useAdminToast } from '../context/AdminToastContext';

export default function ManagePickupPoints() {
  const { showToast } = useAdminToast();
  const [pickupPoints, setPickupPoints] = useState(initialPickupPoints);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [routeFilter, setRouteFilter] = useState('All');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [viewingPoint, setViewingPoint] = useState(null);
  const [deletingPoint, setDeletingPoint] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    pickupPoint: '',
    address: '',
    route: initialRoutes[0]?.routeName || '',
    pickupTime: '07:30 AM',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredPoints = useMemo(() => {
    return pickupPoints.filter((point) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        point.pickupPoint.toLowerCase().includes(q) ||
        point.address.toLowerCase().includes(q);

      const matchesRoute = routeFilter === 'All' || point.route === routeFilter;
      return matchesSearch && matchesRoute;
    });
  }, [pickupPoints, searchQuery, routeFilter]);

  const handleOpenAdd = () => {
    setEditingPoint(null);
    setFormData({
      pickupPoint: '',
      address: '',
      route: initialRoutes[0]?.routeName || '',
      pickupTime: '07:30 AM',
      status: 'Active',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (point) => {
    setEditingPoint(point);
    setFormData({
      pickupPoint: point.pickupPoint,
      address: point.address,
      route: point.route,
      pickupTime: point.pickupTime,
      status: point.status,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.pickupPoint.trim()) errors.pickupPoint = 'Pickup stop name is required.';
    if (!formData.address.trim()) errors.address = 'Street landmark/address is required.';
    if (!formData.route.trim()) errors.route = 'Associated transit route is required.';
    if (!formData.pickupTime.trim()) errors.pickupTime = 'Designated boarding time is required.';
    return errors;
  };

  const handleSavePoint = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingPoint) {
      setPickupPoints((prev) =>
        prev.map((p) =>
          p.id === editingPoint.id ? { ...p, ...formData } : p
        )
      );
      showToast('Pickup point updated successfully.', 'success');
    } else {
      const newPoint = {
        id: `PKP-00${pickupPoints.length + 1}`,
        ...formData,
      };
      setPickupPoints((prev) => [newPoint, ...prev]);
      showToast('Pickup point added successfully.', 'success');
    }

    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingPoint) return;
    setPickupPoints((prev) => prev.filter((p) => p.id !== deletingPoint.id));
    showToast('Pickup point deleted successfully.', 'success');
    setDeletingPoint(null);
  };

  const columns = [
    {
      title: 'Pickup Point',
      key: 'pickupPoint',
      render: (val) => <strong>{val}</strong>,
    },
    { title: 'Address / Landmark', key: 'address' },
    { title: 'Route', key: 'route' },
    { title: 'Pickup Time', key: 'pickupTime' },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, point) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className="admin-action-btn"
            title="View Details"
            onClick={() => setViewingPoint(point)}
            aria-label={`View details of ${point.pickupPoint}`}
          >
            <Icon name="eye" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn"
            title="Edit Pickup Point"
            onClick={() => handleOpenEdit(point)}
            aria-label={`Edit ${point.pickupPoint}`}
          >
            <Icon name="edit" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn admin-action-btn-danger"
            title="Delete Pickup Point"
            onClick={() => setDeletingPoint(point)}
            aria-label={`Delete ${point.pickupPoint}`}
          >
            <Icon name="trash" size={15} />
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
          <h1>Manage Pickup Points</h1>
          <p>Designated boarding locations and morning pickup schedules.</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleOpenAdd}
          >
            <Icon name="plus" size={16} />
            Add Pickup Point
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="admin-controls-bar">
        <div className="admin-filters-group">
          <div className="admin-search-input-wrap">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search by Stop Name, Address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search pickup points"
            />
          </div>

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
        data={filteredPoints}
        keyField="id"
        emptyMessage="No pickup points found."
        emptySubtitle="Try adjusting your search criteria."
      />

      {/* Add / Edit Pickup Point Modal */}
      <AdminModal
        open={isFormModalOpen}
        title={editingPoint ? 'Edit Pickup Point' : 'Add New Pickup Point'}
        onClose={() => setIsFormModalOpen(false)}
        size="md"
        footer={
          <>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setIsFormModalOpen(false)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleSavePoint}
            >
              Save Pickup Point
            </button>
          </>
        }
      >
        <form noValidate onSubmit={handleSavePoint}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              Pickup Point Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`admin-form-input ${formErrors.pickupPoint ? 'is-invalid' : ''}`}
              placeholder="e.g. Greenwood Metro Station"
              value={formData.pickupPoint}
              onChange={(e) => {
                setFormData({ ...formData, pickupPoint: e.target.value });
                setFormErrors({ ...formErrors, pickupPoint: '' });
              }}
            />
            {formErrors.pickupPoint && (
              <span className="admin-form-error">{formErrors.pickupPoint}</span>
            )}
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Address / Landmark <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`admin-form-input ${formErrors.address ? 'is-invalid' : ''}`}
              placeholder="e.g. Outer Ring Road, Gate 2, Opp. HDFC Bank"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                setFormErrors({ ...formErrors, address: '' });
              }}
            />
            {formErrors.address && (
              <span className="admin-form-error">{formErrors.address}</span>
            )}
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                Route <span className="required">*</span>
              </label>
              <select
                className="admin-form-select"
                value={formData.route}
                onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              >
                {initialRoutes.map((r) => (
                  <option key={r.id} value={r.routeName}>
                    {r.routeName}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                Pickup Time <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form-input ${formErrors.pickupTime ? 'is-invalid' : ''}`}
                placeholder="e.g. 07:30 AM"
                value={formData.pickupTime}
                onChange={(e) => {
                  setFormData({ ...formData, pickupTime: e.target.value });
                  setFormErrors({ ...formErrors, pickupTime: '' });
                }}
              />
              {formErrors.pickupTime && (
                <span className="admin-form-error">{formErrors.pickupTime}</span>
              )}
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Status</label>
            <select
              className="admin-form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </AdminModal>

      {/* Pickup Point Details Modal */}
      {viewingPoint && (
        <AdminModal
          open={Boolean(viewingPoint)}
          title="Pickup Point Details"
          onClose={() => setViewingPoint(null)}
          size="md"
          footer={
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setViewingPoint(null)}
            >
              Close
            </button>
          }
        >
          <dl className="admin-info-dl">
            <dt className="admin-info-dt">Pickup Stop:</dt>
            <dd className="admin-info-dd"><strong>{viewingPoint.pickupPoint}</strong></dd>

            <dt className="admin-info-dt">Stop ID:</dt>
            <dd className="admin-info-dd"><code>{viewingPoint.id}</code></dd>

            <dt className="admin-info-dt">Location Landmark:</dt>
            <dd className="admin-info-dd">{viewingPoint.address}</dd>

            <dt className="admin-info-dt">Assigned Route:</dt>
            <dd className="admin-info-dd">{viewingPoint.route}</dd>

            <dt className="admin-info-dt">Scheduled Pickup:</dt>
            <dd className="admin-info-dd">{viewingPoint.pickupTime}</dd>

            <dt className="admin-info-dt">Current Status:</dt>
            <dd className="admin-info-dd">
              <StatusBadge status={viewingPoint.status} />
            </dd>
          </dl>
        </AdminModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingPoint)}
        title="Delete Pickup Point?"
        message={`Are you sure you want to delete ${deletingPoint?.pickupPoint}? Existing student pass holders mapped to this stop will need to be reallocated.`}
        confirmText="Delete Stop"
        cancelText="Cancel"
        danger={true}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingPoint(null)}
      />
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../../common/components/Icon';
import { useAdminToast } from '../context/AdminToastContext';
import { routeService } from '../services/routeService';

export default function ManageRoutes() {
  const { showToast } = useAdminToast();
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState(null);
  const [viewingRoute, setViewingRoute] = useState(null);
  const [deletingRoute, setDeletingRoute] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load routes on mount
  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await routeService.getRoutes(1, 100);
      const routesData = response.data || [];
      setRoutes(routesData);
    } catch (err) {
      const errorMsg = err.message || 'Failed to load routes';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    routeName: '',
    routeCode: '',
    startPoint: '',
    endPoint: '',
    timing: '',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        route.routeName.toLowerCase().includes(q) ||
        route.routeCode.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || route.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [routes, searchQuery, statusFilter]);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setFormData({
      routeName: '',
      routeCode: '',
      startPoint: '',
      endPoint: 'University Main Gate',
      timing: '07:15 AM - 08:30 AM',
      status: 'Active',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (route) => {
    setEditingRoute(route);
    setFormData({
      routeName: route.routeName,
      routeCode: route.routeCode,
      startPoint: route.startPoint,
      endPoint: route.endPoint,
      timing: route.timing,
      status: route.status,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.routeName.trim()) errors.routeName = 'Route name is required.';
    if (!formData.routeCode.trim()) errors.routeCode = 'Route code (e.g. NC-01) is required.';
    if (!formData.startPoint.trim()) errors.startPoint = 'Origin / start point is required.';
    if (!formData.endPoint.trim()) errors.endPoint = 'Destination / end point is required.';
    if (!formData.timing.trim()) errors.timing = 'Operating schedule timing is required.';
    return errors;
  };

  const handleSaveRoute = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingRoute) {
        await routeService.updateRoute(editingRoute._id, formData);
        showToast('Route updated successfully.', 'success');
      } else {
        await routeService.createRoute(formData);
        showToast('Route added successfully.', 'success');
      }
      setIsFormModalOpen(false);
      await loadRoutes();
    } catch (err) {
      const errorMsg = err.message || 'Failed to save route';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingRoute) return;
    try {
      setIsSubmitting(true);
      await routeService.deleteRoute(deletingRoute._id);
      showToast('Route deleted successfully.', 'success');
      setDeletingRoute(null);
      await loadRoutes();
    } catch (err) {
      const errorMsg = err.message || 'Failed to delete route';
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: 'Route Name',
      key: 'routeName',
      render: (val) => <strong>{val}</strong>,
    },
    {
      title: 'Route Code',
      key: 'routeCode',
      render: (val) => <code>{val}</code>,
    },
    { title: 'Start Point', key: 'startPoint' },
    { title: 'End Point', key: 'endPoint' },
    {
      title: 'Pickup Points',
      key: 'pickupPoints',
      render: (val) => `${val} stops`,
    },
    { title: 'Timing', key: 'timing' },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, route) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className="admin-action-btn"
            title="View Details"
            onClick={() => setViewingRoute(route)}
            aria-label={`View details of ${route.routeName}`}
          >
            <Icon name="eye" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn"
            title="Edit Route"
            onClick={() => handleOpenEdit(route)}
            aria-label={`Edit ${route.routeName}`}
          >
            <Icon name="edit" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn admin-action-btn-danger"
            title="Delete Route"
            onClick={() => setDeletingRoute(route)}
            aria-label={`Delete ${route.routeName}`}
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
          <h1>Manage Routes</h1>
          <p>Campus bus transit routes and operating schedules.</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleOpenAdd}
          >
            <Icon name="plus" size={16} />
            Add Route
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
              placeholder="Search by Route Name, Route Code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search routes"
            />
          </div>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading && (
        <div className="admin-loading">
          <p>Loading routes...</p>
        </div>
      )}
      {error && (
        <div className="admin-error">
          <p>{error}</p>
          <button type="button" className="admin-btn admin-btn-primary" onClick={loadRoutes}>
            Retry
          </button>
        </div>
      )}
      {!loading && !error && (
        <DataTable
          columns={columns}
          data={filteredRoutes}
          keyField="_id"
          emptyMessage="No routes found."
          emptySubtitle="Try adjusting your search criteria."
        />
      )}

      {/* Add / Edit Route Modal */}
      <AdminModal
        open={isFormModalOpen}
        title={editingRoute ? 'Edit Route' : 'Add New Route'}
        onClose={() => setIsFormModalOpen(false)}
        size="md"
        footer={
          <>
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setIsFormModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleSaveRoute}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Route'}
            </button>
          </>
        }
      >
        <form noValidate onSubmit={handleSaveRoute}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                Route Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form-input ${formErrors.routeName ? 'is-invalid' : ''}`}
                placeholder="e.g. North Campus Express"
                value={formData.routeName}
                onChange={(e) => {
                  setFormData({ ...formData, routeName: e.target.value });
                  setFormErrors({ ...formErrors, routeName: '' });
                }}
              />
              {formErrors.routeName && (
                <span className="admin-form-error">{formErrors.routeName}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                Route Code <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form-input ${formErrors.routeCode ? 'is-invalid' : ''}`}
                placeholder="e.g. NC-01"
                value={formData.routeCode}
                onChange={(e) => {
                  setFormData({ ...formData, routeCode: e.target.value });
                  setFormErrors({ ...formErrors, routeCode: '' });
                }}
              />
              {formErrors.routeCode && (
                <span className="admin-form-error">{formErrors.routeCode}</span>
              )}
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                Start Point <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form-input ${formErrors.startPoint ? 'is-invalid' : ''}`}
                placeholder="e.g. Hebbal Terminal"
                value={formData.startPoint}
                onChange={(e) => {
                  setFormData({ ...formData, startPoint: e.target.value });
                  setFormErrors({ ...formErrors, startPoint: '' });
                }}
              />
              {formErrors.startPoint && (
                <span className="admin-form-error">{formErrors.startPoint}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                End Point <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form-input ${formErrors.endPoint ? 'is-invalid' : ''}`}
                placeholder="e.g. University Main Gate"
                value={formData.endPoint}
                onChange={(e) => {
                  setFormData({ ...formData, endPoint: e.target.value });
                  setFormErrors({ ...formErrors, endPoint: '' });
                }}
              />
              {formErrors.endPoint && (
                <span className="admin-form-error">{formErrors.endPoint}</span>
              )}
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                Timing <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form-input ${formErrors.timing ? 'is-invalid' : ''}`}
                placeholder="e.g. 07:15 AM - 08:30 AM"
                value={formData.timing}
                onChange={(e) => {
                  setFormData({ ...formData, timing: e.target.value });
                  setFormErrors({ ...formErrors, timing: '' });
                }}
              />
              {formErrors.timing && (
                <span className="admin-form-error">{formErrors.timing}</span>
              )}
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
          </div>
        </form>
      </AdminModal>

      {/* Route Details Modal */}
      {viewingRoute && (
        <AdminModal
          open={Boolean(viewingRoute)}
          title="Transit Route Details"
          onClose={() => setViewingRoute(null)}
          size="md"
          footer={
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setViewingRoute(null)}
            >
              Close
            </button>
          }
        >
          <dl className="admin-info-dl">
            <dt className="admin-info-dt">Route Name:</dt>
            <dd className="admin-info-dd"><strong>{viewingRoute.routeName}</strong></dd>

            <dt className="admin-info-dt">Route Code:</dt>
            <dd className="admin-info-dd"><code>{viewingRoute.routeCode}</code></dd>

            <dt className="admin-info-dt">Starting Terminal:</dt>
            <dd className="admin-info-dd">{viewingRoute.startPoint}</dd>

            <dt className="admin-info-dt">Destination Gate:</dt>
            <dd className="admin-info-dd">{viewingRoute.endPoint}</dd>

            <dt className="admin-info-dt">Designated Stops:</dt>
            <dd className="admin-info-dd">{viewingRoute.pickupPoints} designated stops</dd>

            <dt className="admin-info-dt">Schedule Timing:</dt>
            <dd className="admin-info-dd">{viewingRoute.timing}</dd>

            <dt className="admin-info-dt">Current Status:</dt>
            <dd className="admin-info-dd">
              <StatusBadge status={viewingRoute.status} />
            </dd>
          </dl>
        </AdminModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingRoute)}
        title="Delete Route?"
        message={`Are you sure you want to delete ${deletingRoute?.routeName} (${deletingRoute?.routeCode})? Associated pickup points and assignments may be impacted.`}
        confirmText="Delete Route"
        cancelText="Cancel"
        danger={true}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingRoute(null)}
      />
    </div>
  );
}

import { useState, useMemo, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../../common/components/Icon';
import { useAdminToast } from '../context/AdminToastContext';
import { busService } from '../services/busService';
import { driverService } from '../services/driverService';

export default function ManageBuses() {
  const { showToast } = useAdminToast();
  const [buses, setBuses] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Load data on mount
  useEffect(() => {
    loadBuses();
    loadDrivers();
  }, [page]);

  const loadBuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await busService.getBuses(page, limit, searchQuery);
      setBuses(response.data || []);
    } catch (err) {
      setError(err.message);
      showToast(`Error loading buses: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await driverService.getDrivers(1, 100);
      setDrivers(response.data || []);
    } catch (err) {
      console.error('Error loading drivers:', err);
    }
  };

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingBus, setEditingBus] = useState(null);
  const [viewingBus, setViewingBus] = useState(null);
  const [deletingBus, setDeletingBus] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    busNumber: '',
    registrationNumber: '',
    capacity: 45,
    assignedDriver: 'Unassigned',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  // Summary counts
  const totalCount = buses.length;
  const activeCount = buses.filter((b) => b.status === 'Active').length;
  const maintCount = buses.filter((b) => b.status === 'Maintenance').length;
  const inactiveCount = buses.filter((b) => b.status === 'Inactive').length;

  const filteredBuses = useMemo(() => {
    return buses.filter((bus) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        bus.busNumber.toLowerCase().includes(q) ||
        bus.registrationNumber.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || bus.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [buses, searchQuery, statusFilter]);

  const handleOpenAdd = () => {
    setEditingBus(null);
    setFormData({
      busNumber: '',
      registrationNumber: '',
      capacity: 48,
      assignedDriver: 'Unassigned',
      status: 'Active',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (bus) => {
    setEditingBus(bus);
    setFormData({
      busNumber: bus.busNumber || '',
      registrationNumber: bus.registrationNumber || '',
      capacity: bus.capacity || 48,
      assignedDriver: bus.assignedDriver || 'Unassigned',
      status: bus.status || 'Active',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.busNumber.trim()) errors.busNumber = 'Bus identifier (e.g. Bus 108) is required.';
    if (!formData.registrationNumber.trim()) {
      errors.registrationNumber = 'RTO vehicle registration number is required.';
    }
    const cap = Number(formData.capacity);
    if (!cap || cap < 10 || cap > 100) {
      errors.capacity = 'Capacity must be between 10 and 100 passenger seats.';
    }
    return errors;
  };

  const handleSaveBus = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        capacity: Number(formData.capacity),
      };

      if (editingBus) {
        await busService.updateBus(editingBus._id, dataToSave);
        showToast('Bus updated successfully.', 'success');
      } else {
        await busService.createBus(dataToSave);
        showToast('Bus added successfully.', 'success');
      }

      setIsFormModalOpen(false);
      loadBuses();
    } catch (err) {
      showToast(`Error saving bus: ${err.message}`, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBus) return;
    try {
      await busService.deleteBus(deletingBus._id);
      showToast('Bus deleted successfully.', 'success');
      setDeletingBus(null);
      loadBuses();
    } catch (err) {
      showToast(`Error deleting bus: ${err.message}`, 'error');
    }
  };

  const columns = [
    {
      title: 'Bus Number',
      key: 'busNumber',
      render: (val) => <strong>{val}</strong>,
    },
    { title: 'Registration Number', key: 'registrationNumber' },
    {
      title: 'Capacity',
      key: 'capacity',
      render: (val) => `${val} seats`,
    },
    { title: 'Assigned Driver', key: 'assignedDriver' },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, bus) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className="admin-action-btn"
            title="View Details"
            onClick={() => setViewingBus(bus)}
            aria-label={`View details of ${bus.busNumber}`}
          >
            <Icon name="eye" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn"
            title="Edit Bus"
            onClick={() => handleOpenEdit(bus)}
            aria-label={`Edit ${bus.busNumber}`}
          >
            <Icon name="edit" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn admin-action-btn-danger"
            title="Delete Bus"
            onClick={() => setDeletingBus(bus)}
            aria-label={`Delete ${bus.busNumber}`}
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
          <h1>Manage Buses</h1>
          <p>University transit fleet registry and status tracking.</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleOpenAdd}
          >
            <Icon name="plus" size={16} />
            Add Bus
          </button>
        </div>
      </div>

      {/* Cards at top */}
      <div className="admin-stat-grid">
        <StatCard
          title="Total Buses"
          value={totalCount}
          subtitle="Total campus fleet"
          icon="bus"
        />
        <StatCard
          title="Active"
          value={activeCount}
          subtitle="Currently operational"
          icon="check-circle"
        />
        <StatCard
          title="Maintenance"
          value={maintCount}
          subtitle="Under repair / service"
          icon="alert-circle"
        />
        <StatCard
          title="Inactive"
          value={inactiveCount}
          subtitle="Reserve vehicles"
          icon="x-circle"
        />
      </div>

      {/* Controls Bar */}
      <div className="admin-controls-bar">
        <div className="admin-filters-group">
          <div className="admin-search-input-wrap">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search by Bus Number, Reg Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search buses"
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
            <option value="Maintenance">Maintenance</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredBuses}
        keyField="id"
        emptyMessage="No buses found."
        emptySubtitle="Try adjusting your search criteria."
      />

      {/* Add / Edit Bus Modal */}
      <AdminModal
        open={isFormModalOpen}
        title={editingBus ? 'Edit Bus' : 'Add New Bus'}
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
              onClick={handleSaveBus}
            >
              Save Bus
            </button>
          </>
        }
      >
        <form noValidate onSubmit={handleSaveBus}>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                Bus Number <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form-input ${formErrors.busNumber ? 'is-invalid' : ''}`}
                placeholder="e.g. Bus 108"
                value={formData.busNumber}
                onChange={(e) => {
                  setFormData({ ...formData, busNumber: e.target.value });
                  setFormErrors({ ...formErrors, busNumber: '' });
                }}
              />
              {formErrors.busNumber && (
                <span className="admin-form-error">{formErrors.busNumber}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                Registration Number <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form-input ${formErrors.registrationNumber ? 'is-invalid' : ''}`}
                placeholder="e.g. KA-01-F-2041"
                value={formData.registrationNumber}
                onChange={(e) => {
                  setFormData({ ...formData, registrationNumber: e.target.value });
                  setFormErrors({ ...formErrors, registrationNumber: '' });
                }}
              />
              {formErrors.registrationNumber && (
                <span className="admin-form-error">{formErrors.registrationNumber}</span>
              )}
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                Seating Capacity <span className="required">*</span>
              </label>
              <input
                type="number"
                min="10"
                max="100"
                className={`admin-form-input ${formErrors.capacity ? 'is-invalid' : ''}`}
                value={formData.capacity}
                onChange={(e) => {
                  setFormData({ ...formData, capacity: e.target.value });
                  setFormErrors({ ...formErrors, capacity: '' });
                }}
              />
              {formErrors.capacity && (
                <span className="admin-form-error">{formErrors.capacity}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Assigned Driver</label>
              <select
                className="admin-form-select"
                value={formData.assignedDriver}
                onChange={(e) =>
                  setFormData({ ...formData, assignedDriver: e.target.value })
                }
              >
                <option value="Unassigned">Unassigned</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d.name}>
                    {d.name} ({d.licenseNumber})
                  </option>
                ))}
              </select>
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
              <option value="Maintenance">Maintenance</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </AdminModal>

      {/* Bus Details Modal */}
      {viewingBus && (
        <AdminModal
          open={Boolean(viewingBus)}
          title="Bus Vehicle Details"
          onClose={() => setViewingBus(null)}
          size="md"
          footer={
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setViewingBus(null)}
            >
              Close
            </button>
          }
        >
          <dl className="admin-info-dl">
            <dt className="admin-info-dt">Bus Identifier:</dt>
            <dd className="admin-info-dd"><strong>{viewingBus.busNumber}</strong></dd>

            <dt className="admin-info-dt">Registration No:</dt>
            <dd className="admin-info-dd"><code>{viewingBus.registrationNumber}</code></dd>

            <dt className="admin-info-dt">Total Capacity:</dt>
            <dd className="admin-info-dd">{viewingBus.capacity} passenger seats</dd>

            <dt className="admin-info-dt">Assigned Driver:</dt>
            <dd className="admin-info-dd">{viewingBus.assignedDriver}</dd>

            <dt className="admin-info-dt">Vehicle Status:</dt>
            <dd className="admin-info-dd">
              <StatusBadge status={viewingBus.status} />
            </dd>
          </dl>
        </AdminModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingBus)}
        title="Delete Bus?"
        message={`Are you sure you want to delete ${deletingBus?.busNumber} (${deletingBus?.registrationNumber})? This will unassign any routes and students linked to this vehicle.`}
        confirmText="Delete Bus"
        cancelText="Cancel"
        danger={true}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingBus(null)}
      />
    </div>
  );
}

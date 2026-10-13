import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../../common/components/Icon';
import { initialDrivers } from '../data/adminMockData';
import { useAdminToast } from '../context/AdminToastContext';

export default function ManageDrivers() {
  const { showToast } = useAdminToast();
  const [drivers, setDrivers] = useState(initialDrivers);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [viewingDriver, setViewingDriver] = useState(null);
  const [deletingDriver, setDeletingDriver] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  const filteredDrivers = useMemo(() => {
    return drivers.filter((driver) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        driver.name.toLowerCase().includes(q) ||
        driver.licenseNumber.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'All' || driver.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchQuery, statusFilter]);

  const handleOpenAdd = () => {
    setEditingDriver(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      licenseNumber: '',
      status: 'Active',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      status: driver.status,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Driver name is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address.';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[\d\s+\-()]{8,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Enter a valid phone number.';
    }
    if (!formData.licenseNumber.trim()) {
      errors.licenseNumber = 'Commercial driving license number is required.';
    }
    return errors;
  };

  const handleSaveDriver = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingDriver) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === editingDriver.id ? { ...d, ...formData } : d
        )
      );
      showToast('Driver updated successfully.', 'success');
    } else {
      const newDriver = {
        id: `DRV-00${drivers.length + 1}`,
        ...formData,
        assignedBus: 'Unassigned',
      };
      setDrivers((prev) => [newDriver, ...prev]);
      showToast('Driver added successfully.', 'success');
    }

    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingDriver) return;
    setDrivers((prev) => prev.filter((d) => d.id !== deletingDriver.id));
    showToast('Driver deleted successfully.', 'success');
    setDeletingDriver(null);
  };

  const columns = [
    {
      title: 'Driver Name',
      key: 'name',
      render: (val) => <strong>{val}</strong>,
    },
    { title: 'Email', key: 'email' },
    { title: 'Phone', key: 'phone' },
    { title: 'License Number', key: 'licenseNumber' },
    { title: 'Assigned Bus', key: 'assignedBus' },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, driver) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className="admin-action-btn"
            title="View Details"
            onClick={() => setViewingDriver(driver)}
            aria-label={`View details of ${driver.name}`}
          >
            <Icon name="eye" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn"
            title="Edit Driver"
            onClick={() => handleOpenEdit(driver)}
            aria-label={`Edit ${driver.name}`}
          >
            <Icon name="edit" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn admin-action-btn-danger"
            title="Delete Driver"
            onClick={() => setDeletingDriver(driver)}
            aria-label={`Delete ${driver.name}`}
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
          <h1>Manage Drivers</h1>
          <p>Fleet drivers and vehicle assignments.</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleOpenAdd}
          >
            <Icon name="plus" size={16} />
            Add Driver
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
              placeholder="Search by Name, License Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search drivers"
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
      <DataTable
        columns={columns}
        data={filteredDrivers}
        keyField="id"
        emptyMessage="No drivers found."
        emptySubtitle="Try adjusting your search criteria."
      />

      {/* Add / Edit Driver Modal */}
      <AdminModal
        open={isFormModalOpen}
        title={editingDriver ? 'Edit Driver' : 'Add New Driver'}
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
              onClick={handleSaveDriver}
            >
              Save Driver
            </button>
          </>
        }
      >
        <form noValidate onSubmit={handleSaveDriver}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`admin-form-input ${formErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Rajesh Kumar"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                setFormErrors({ ...formErrors, name: '' });
              }}
            />
            {formErrors.name && (
              <span className="admin-form-error">{formErrors.name}</span>
            )}
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                className={`admin-form-input ${formErrors.email ? 'is-invalid' : ''}`}
                placeholder="e.g. driver@campus.edu"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                  setFormErrors({ ...formErrors, email: '' });
                }}
              />
              {formErrors.email && (
                <span className="admin-form-error">{formErrors.email}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                Phone Number <span className="required">*</span>
              </label>
              <input
                type="tel"
                className={`admin-form-input ${formErrors.phone ? 'is-invalid' : ''}`}
                placeholder="e.g. +91 98234 11223"
                value={formData.phone}
                onChange={(e) => {
                  setFormData({ ...formData, phone: e.target.value });
                  setFormErrors({ ...formErrors, phone: '' });
                }}
              />
              {formErrors.phone && (
                <span className="admin-form-error">{formErrors.phone}</span>
              )}
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">
              Commercial License Number <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`admin-form-input ${formErrors.licenseNumber ? 'is-invalid' : ''}`}
              placeholder="e.g. DL-042011002341"
              value={formData.licenseNumber}
              onChange={(e) => {
                setFormData({ ...formData, licenseNumber: e.target.value });
                setFormErrors({ ...formErrors, licenseNumber: '' });
              }}
            />
            {formErrors.licenseNumber && (
              <span className="admin-form-error">{formErrors.licenseNumber}</span>
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
        </form>
      </AdminModal>

      {/* Driver Details Modal */}
      {viewingDriver && (
        <AdminModal
          open={Boolean(viewingDriver)}
          title="Driver Profile Details"
          onClose={() => setViewingDriver(null)}
          size="md"
          footer={
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setViewingDriver(null)}
            >
              Close
            </button>
          }
        >
          <dl className="admin-info-dl">
            <dt className="admin-info-dt">Driver Name:</dt>
            <dd className="admin-info-dd"><strong>{viewingDriver.name}</strong></dd>

            <dt className="admin-info-dt">Driver ID:</dt>
            <dd className="admin-info-dd"><code>{viewingDriver.id}</code></dd>

            <dt className="admin-info-dt">Email Address:</dt>
            <dd className="admin-info-dd">{viewingDriver.email}</dd>

            <dt className="admin-info-dt">Contact Phone:</dt>
            <dd className="admin-info-dd">{viewingDriver.phone}</dd>

            <dt className="admin-info-dt">License Number:</dt>
            <dd className="admin-info-dd"><strong>{viewingDriver.licenseNumber}</strong></dd>

            <dt className="admin-info-dt">Assigned Vehicle:</dt>
            <dd className="admin-info-dd">{viewingDriver.assignedBus}</dd>

            <dt className="admin-info-dt">Current Status:</dt>
            <dd className="admin-info-dd">
              <StatusBadge status={viewingDriver.status} />
            </dd>
          </dl>
        </AdminModal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deletingDriver)}
        title="Delete Driver?"
        message={`Are you sure you want to delete ${deletingDriver?.name} (${deletingDriver?.licenseNumber})? Any assigned bus will become unassigned.`}
        confirmText="Delete Driver"
        cancelText="Cancel"
        danger={true}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingDriver(null)}
      />
    </div>
  );
}

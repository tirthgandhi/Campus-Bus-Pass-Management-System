import { useState, useMemo, useEffect } from 'react';
import DataTable from '../components/DataTable';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../../common/components/Icon';
import { useAdminToast } from '../context/AdminToastContext';
import { pickupPointService } from '../services/pickupPointService';

export default function ManagePickupPoints() {
  const { showToast } = useAdminToast();
  const [pickupPoints, setPickupPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPickupPoints();
  }, []);

  const loadPickupPoints = async () => {
    try {
      const response = await pickupPointService.getPickupPoints(1, 100, searchQuery);
      setPickupPoints(response.data || []);
    } catch (err) {
      showToast(`Error loading pickup points: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPoint, setEditingPoint] = useState(null);
  const [viewingPoint, setViewingPoint] = useState(null);
  const [deletingPoint, setDeleteingPoint] = useState(null);

  const [formData, setFormData] = useState({
    pickupPoint: '',
    address: '',
    latitude: '',
    longitude: '',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  const handleOpenAdd = () => {
    setEditingPoint(null);
    setFormData({
      pickupPoint: '',
      address: '',
      latitude: '',
      longitude: '',
      status: 'Active',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (point) => {
    setEditingPoint(point);
    setFormData({
      pickupPoint: point.pickupPoint || '',
      address: point.address || '',
      latitude: point.latitude || '',
      longitude: point.longitude || '',
      status: point.status || 'Active',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.pickupPoint.trim()) errors.pickupPoint = 'Pickup point name is required.';
    if (!formData.address.trim()) errors.address = 'Address is required.';
    return errors;
  };

  const handleSavePoint = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      if (editingPoint) {
        await pickupPointService.updatePickupPoint(editingPoint._id, formData);
        showToast('Pickup point updated successfully.', 'success');
      } else {
        await pickupPointService.createPickupPoint(formData);
        showToast('Pickup point added successfully.', 'success');
      }
      setIsFormModalOpen(false);
      loadPickupPoints();
    } catch (err) {
      showToast(`Error saving pickup point: ${err.message}`, 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPoint) return;
    try {
      await pickupPointService.deletePickupPoint(deletingPoint._id);
      showToast('Pickup point deleted successfully.', 'success');
      setDeleteingPoint(null);
      loadPickupPoints();
    } catch (err) {
      showToast(`Error deleting pickup point: ${err.message}`, 'error');
    }
  };

  const columns = [
    {
      title: 'Pickup Point',
      key: 'pickupPoint',
      render: (val) => <strong>{val}</strong>,
    },
    { title: 'Address', key: 'address' },
    { title: 'Status', key: 'status' },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, point) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => setViewingPoint(point)}
            title="View"
          >
            <Icon name="eye" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => handleOpenEdit(point)}
            title="Edit"
          >
            <Icon name="edit" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn admin-action-btn-danger"
            onClick={() => setDeleteingPoint(point)}
            title="Delete"
          >
            <Icon name="trash" size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Manage Pickup Points</h1>
          <p>Bus stop locations and schedules.</p>
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

      <div className="admin-controls-bar">
        <div className="admin-filters-group">
          <div className="admin-search-input-wrap">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search pickup points..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div><p>Loading...</p></div>
      ) : (
        <DataTable
          columns={columns}
          data={pickupPoints}
          keyField="_id"
          emptyMessage="No pickup points found."
        />
      )}

      <AdminModal
        open={isFormModalOpen}
        title={editingPoint ? 'Edit Pickup Point' : 'Add Pickup Point'}
        onClose={() => setIsFormModalOpen(false)}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </button>
            <button type="button" className="admin-btn admin-btn-primary" onClick={handleSavePoint}>
              Save
            </button>
          </>
        }
      >
        <form onSubmit={handleSavePoint}>
          <div className="admin-form-group">
            <label className="admin-form-label">Pickup Point Name</label>
            <input
              type="text"
              className="admin-form-input"
              value={formData.pickupPoint}
              onChange={(e) => setFormData({ ...formData, pickupPoint: e.target.value })}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Address</label>
            <input
              type="text"
              className="admin-form-input"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
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

      {viewingPoint && (
        <AdminModal
          open={true}
          title="Pickup Point Details"
          onClose={() => setViewingPoint(null)}
          footer={
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setViewingPoint(null)}>
              Close
            </button>
          }
        >
          <dl className="admin-info-dl">
            <dt>Name:</dt>
            <dd><strong>{viewingPoint.pickupPoint}</strong></dd>
            <dt>Address:</dt>
            <dd>{viewingPoint.address}</dd>
            <dt>Status:</dt>
            <dd>{viewingPoint.status}</dd>
          </dl>
        </AdminModal>
      )}

      <ConfirmDialog
        open={Boolean(deletingPoint)}
        title="Delete Pickup Point?"
        message={`Delete ${deletingPoint?.pickupPoint}?`}
        confirmText="Delete"
        cancelText="Cancel"
        danger={true}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteingPoint(null)}
      />
    </div>
  );
}

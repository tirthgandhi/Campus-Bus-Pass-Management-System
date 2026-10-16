import { useState, useEffect } from 'react';
import AdminModal from '../components/AdminModal';
import Icon from '../../common/components/Icon';
import { useAdminToast } from '../context/AdminToastContext';
import { dashboardService } from '../services/dashboardService';

export default function AdminProfile() {
  const { showToast } = useAdminToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await dashboardService.getProfile();
      setProfile(response.data || {});
      setFormData(response.data || {});
    } catch (err) {
      showToast(`Error loading profile: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await dashboardService.updateProfile(formData);
      showToast('Profile updated successfully.', 'success');
      setIsEditing(false);
      loadProfile();
    } catch (err) {
      showToast(`Error updating profile: ${err.message}`, 'error');
    }
  };

  if (loading) return <div className="admin-page-container"><p>Loading profile...</p></div>;

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Admin Profile</h1>
          <p>Manage your admin account settings.</p>
        </div>
        <button type="button" className="admin-btn admin-btn-primary" onClick={() => setIsEditing(true)}>
          <Icon name="edit" size={16} />
          Edit Profile
        </button>
      </div>

      {profile && (
        <div className="admin-card">
          <dl className="admin-info-dl">
            <dt>Name:</dt>
            <dd><strong>{profile.name}</strong></dd>
            <dt>Email:</dt>
            <dd>{profile.email}</dd>
            <dt>Role:</dt>
            <dd>{profile.role}</dd>
            <dt>Department:</dt>
            <dd>{profile.department}</dd>
          </dl>
        </div>
      )}

      <AdminModal
        open={isEditing}
        title="Edit Profile"
        onClose={() => setIsEditing(false)}
        footer={
          <>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
            <button type="button" className="admin-btn admin-btn-primary" onClick={handleSaveProfile}>
              Save Changes
            </button>
          </>
        }
      >
        <form>
          <div className="admin-form-group">
            <label className="admin-form-label">Name</label>
            <input type="text" className="admin-form-input" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Email</label>
            <input type="email" className="admin-form-input" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Department</label>
            <input type="text" className="admin-form-input" value={formData.department || ''} onChange={(e) => setFormData({ ...formData, department: e.target.value })} />
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

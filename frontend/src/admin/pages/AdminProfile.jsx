import { useState } from 'react';
import Icon from '../../common/components/Icon';
import { initialAdminProfile } from '../data/adminMockData';
import { useAdminToast } from '../context/AdminToastContext';

export default function AdminProfile() {
  const { showToast } = useAdminToast();
  const [profile, setProfile] = useState(initialAdminProfile);
  const [isEditing, setIsEditing] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
  });
  const [errors, setErrors] = useState({});

  const initials = profile.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const handleStartEdit = () => {
    setFormData({
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrors({});
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required.';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    }
    return errs;
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setProfile((prev) => ({
      ...prev,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
    }));

    setIsEditing(false);
    showToast('Profile updated successfully.', 'success');
  };

  return (
    <div className="admin-page-container">
      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Admin Profile</h1>
          <p>Manage your university transportation administrative credentials.</p>
        </div>
      </div>

      <div className="admin-profile-card-large">
        <div className="admin-profile-hero">
          <div className="admin-profile-avatar-lg" aria-hidden="true">
            {initials}
          </div>
          <div className="admin-profile-hero-text">
            <h2>{profile.name}</h2>
            <span className="admin-profile-hero-role">{profile.role}</span>
            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--admin-text-secondary)' }}>
              Employee ID: <code>{profile.employeeId}</code>
            </div>
          </div>
        </div>

        {!isEditing ? (
          <div>
            <dl className="admin-info-dl" style={{ marginBottom: '28px' }}>
              <dt className="admin-info-dt">Full Name:</dt>
              <dd className="admin-info-dd"><strong>{profile.name}</strong></dd>

              <dt className="admin-info-dt">Email Address:</dt>
              <dd className="admin-info-dd">{profile.email}</dd>

              <dt className="admin-info-dt">Contact Phone:</dt>
              <dd className="admin-info-dd">{profile.phone}</dd>

              <dt className="admin-info-dt">System Role:</dt>
              <dd className="admin-info-dd">{profile.role}</dd>

              <dt className="admin-info-dt">Department:</dt>
              <dd className="admin-info-dd">{profile.department}</dd>

              <dt className="admin-info-dt">Office Location:</dt>
              <dd className="admin-info-dd">{profile.officeLocation}</dd>

              <dt className="admin-info-dt">Joined Service:</dt>
              <dd className="admin-info-dd">{profile.joinedDate}</dd>
            </dl>

            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={handleStartEdit}
            >
              <Icon name="edit" size={16} />
              Edit Profile
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={handleSaveProfile}>
            <div className="admin-form-group">
              <label className="admin-form-label">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form-input ${errors.name ? 'is-invalid' : ''}`}
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors({ ...errors, name: '' });
                }}
              />
              {errors.name && <span className="admin-form-error">{errors.name}</span>}
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className={`admin-form-input ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    setErrors({ ...errors, email: '' });
                  }}
                />
                {errors.email && <span className="admin-form-error">{errors.email}</span>}
              </div>

              <div className="admin-form-group">
                <label className="admin-form-label">
                  Phone Number <span className="required">*</span>
                </label>
                <input
                  type="tel"
                  className={`admin-form-input ${errors.phone ? 'is-invalid' : ''}`}
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({ ...formData, phone: e.target.value });
                    setErrors({ ...errors, phone: '' });
                  }}
                />
                {errors.phone && <span className="admin-form-error">{errors.phone}</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn admin-btn-primary"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

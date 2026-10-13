import { useState, useMemo } from 'react';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AdminModal from '../components/AdminModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Icon from '../../common/components/Icon';
import { initialStudents } from '../data/adminMockData';
import { useAdminToast } from '../context/AdminToastContext';

const DEPARTMENTS = [
  'Computer Science',
  'Electronics & Comm.',
  'Mechanical Eng.',
  'Civil Engineering',
  'Management Studies',
];

export default function ManageStudents() {
  const { showToast } = useAdminToast();
  const [students, setStudents] = useState(initialStudents);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  const [deletingStudent, setDeletingStudent] = useState(null);

  // Form state & errors
  const [formData, setFormData] = useState({
    name: '',
    enrollmentNo: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.enrollmentNo.toLowerCase().includes(q) ||
        student.email.toLowerCase().includes(q);

      const matchesDept = deptFilter === 'All' || student.department === deptFilter;
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [students, searchQuery, deptFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      enrollmentNo: '',
      email: '',
      phone: '',
      department: 'Computer Science',
      status: 'Active',
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      enrollmentNo: student.enrollmentNo,
      email: student.email,
      phone: student.phone,
      department: student.department,
      status: student.status,
    });
    setFormErrors({});
    setIsFormModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required.';
    if (!formData.enrollmentNo.trim()) errors.enrollmentNo = 'Enrollment number is required.';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid university email address.';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!/^[\d\s+\-()]{8,15}$/.test(formData.phone.trim())) {
      errors.phone = 'Enter a valid contact phone number.';
    }
    return errors;
  };

  const handleSaveStudent = (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id
            ? { ...s, ...formData }
            : s
        )
      );
      showToast('Student updated successfully.', 'success');
    } else {
      const newStudent = {
        id: `STU-00${students.length + 1}`,
        ...formData,
        assignedBus: 'Unassigned',
        assignedRoute: 'Unassigned',
        pickupPoint: 'Pending Selection',
      };
      setStudents((prev) => [newStudent, ...prev]);
      showToast('Student added successfully.', 'success');
    }

    setIsFormModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!deletingStudent) return;
    setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
    showToast('Student deleted successfully.', 'success');
    setDeletingStudent(null);
  };

  const columns = [
    {
      title: 'Student Name',
      key: 'name',
      render: (val) => <strong>{val}</strong>,
    },
    { title: 'Enrollment No', key: 'enrollmentNo' },
    { title: 'Email', key: 'email' },
    { title: 'Phone', key: 'phone' },
    { title: 'Department', key: 'department' },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, student) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className="admin-action-btn"
            title="View Details"
            onClick={() => setViewingStudent(student)}
            aria-label={`View details of ${student.name}`}
          >
            <Icon name="eye" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn"
            title="Edit Student"
            onClick={() => handleOpenEdit(student)}
            aria-label={`Edit ${student.name}`}
          >
            <Icon name="edit" size={15} />
          </button>
          <button
            type="button"
            className="admin-action-btn admin-action-btn-danger"
            title="Delete Student"
            onClick={() => setDeletingStudent(student)}
            aria-label={`Delete ${student.name}`}
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
          <h1>Manage Students</h1>
          <p>View and manage registered students.</p>
        </div>
        <div className="admin-page-actions">
          <button
            type="button"
            className="admin-btn admin-btn-primary"
            onClick={handleOpenAdd}
          >
            <Icon name="plus" size={16} />
            Add Student
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
              placeholder="Search by Name, Enrollment No, Email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search students"
            />
          </div>

          <select
            className="admin-filter-select"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            aria-label="Filter by department"
          >
            <option value="All">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending">Pending</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        keyField="id"
        emptyMessage="No students found."
        emptySubtitle="Try adjusting your search or filter options."
      />

      {/* Add / Edit Student Modal */}
      <AdminModal
        open={isFormModalOpen}
        title={editingStudent ? 'Edit Student' : 'Add New Student'}
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
              onClick={handleSaveStudent}
            >
              Save Student
            </button>
          </>
        }
      >
        <form noValidate onSubmit={handleSaveStudent}>
          <div className="admin-form-group">
            <label className="admin-form-label">
              Full Name <span className="required">*</span>
            </label>
            <input
              type="text"
              className={`admin-form-input ${formErrors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Aarav Sharma"
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
                Enrollment Number <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`admin-form-input ${formErrors.enrollmentNo ? 'is-invalid' : ''}`}
                placeholder="e.g. 2024BCSE042"
                value={formData.enrollmentNo}
                onChange={(e) => {
                  setFormData({ ...formData, enrollmentNo: e.target.value });
                  setFormErrors({ ...formErrors, enrollmentNo: '' });
                }}
              />
              {formErrors.enrollmentNo && (
                <span className="admin-form-error">{formErrors.enrollmentNo}</span>
              )}
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">
                Department <span className="required">*</span>
              </label>
              <select
                className="admin-form-select"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
              >
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label className="admin-form-label">
                College Email <span className="required">*</span>
              </label>
              <input
                type="email"
                className={`admin-form-input ${formErrors.email ? 'is-invalid' : ''}`}
                placeholder="e.g. student@campus.edu"
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
                placeholder="e.g. +91 98765 43210"
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
            <label className="admin-form-label">Status</label>
            <select
              className="admin-form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </form>
      </AdminModal>

      {/* Student Details Modal */}
      {viewingStudent && (
        <AdminModal
          open={Boolean(viewingStudent)}
          title="Student Information"
          onClose={() => setViewingStudent(null)}
          size="md"
          footer={
            <button
              type="button"
              className="admin-btn admin-btn-secondary"
              onClick={() => setViewingStudent(null)}
            >
              Close
            </button>
          }
        >
          <dl className="admin-info-dl">
            <dt className="admin-info-dt">Full Name:</dt>
            <dd className="admin-info-dd"><strong>{viewingStudent.name}</strong></dd>

            <dt className="admin-info-dt">Enrollment No:</dt>
            <dd className="admin-info-dd">{viewingStudent.enrollmentNo}</dd>

            <dt className="admin-info-dt">Department:</dt>
            <dd className="admin-info-dd">{viewingStudent.department}</dd>

            <dt className="admin-info-dt">College Email:</dt>
            <dd className="admin-info-dd">{viewingStudent.email}</dd>

            <dt className="admin-info-dt">Phone Number:</dt>
            <dd className="admin-info-dd">{viewingStudent.phone}</dd>

            <dt className="admin-info-dt">Current Status:</dt>
            <dd className="admin-info-dd">
              <StatusBadge status={viewingStudent.status} />
            </dd>

            <dt className="admin-info-dt">Assigned Bus:</dt>
            <dd className="admin-info-dd">{viewingStudent.assignedBus}</dd>

            <dt className="admin-info-dt">Assigned Route:</dt>
            <dd className="admin-info-dd">{viewingStudent.assignedRoute}</dd>

            <dt className="admin-info-dt">Pickup Point:</dt>
            <dd className="admin-info-dd">{viewingStudent.pickupPoint}</dd>
          </dl>
        </AdminModal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deletingStudent)}
        title="Delete Student?"
        message={`Are you sure you want to delete ${deletingStudent?.name} (${deletingStudent?.enrollmentNo})? This record will be permanently removed.`}
        confirmText="Delete Student"
        cancelText="Cancel"
        danger={true}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingStudent(null)}
      />
    </div>
  );
}

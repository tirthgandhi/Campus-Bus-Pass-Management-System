import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Icon from '../../common/components/Icon';
import { useAdminToast } from '../context/AdminToastContext';
import { assignmentService } from '../services/assignmentService';

export default function ManageAssignments() {
  const { showToast } = useAdminToast();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      const response = await assignmentService.getAssignments(1, 100, searchQuery);
      setAssignments(response.data || []);
    } catch (err) {
      showToast(`Error loading assignments: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Student', key: 'studentName' },
    { title: 'Bus', key: 'busNumber' },
    { title: 'Route', key: 'routeName' },
    { title: 'Pickup Point', key: 'pickupPoint' },
    { title: 'Status', key: 'status' },
  ];

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Bus Assignments</h1>
          <p>Student-to-bus and route assignments.</p>
        </div>
      </div>

      <div className="admin-controls-bar">
        <div className="admin-filters-group">
          <div className="admin-search-input-wrap">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {loading ? <div><p>Loading...</p></div> : <DataTable columns={columns} data={assignments} keyField="_id" emptyMessage="No assignments found." />}
    </div>
  );
}

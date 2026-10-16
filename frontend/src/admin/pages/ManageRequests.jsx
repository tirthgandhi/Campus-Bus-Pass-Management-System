import { useState, useMemo, useEffect } from 'react';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import AdminModal from '../components/AdminModal';
import Icon from '../../common/components/Icon';
import { useAdminToast } from '../context/AdminToastContext';
import { requestService } from '../services/requestService';

export default function ManageRequests() {
  const { showToast } = useAdminToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const response = await requestService.getRequests(1, 100, searchQuery);
      setRequests(response.data || []);
    } catch (err) {
      showToast(`Error loading requests: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const [viewingRequest, setViewingRequest] = useState(null);

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const approvedCount = requests.filter((r) => r.status === 'Approved').length;
  const rejectedCount = requests.filter((r) => r.status === 'Rejected').length;

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (req.studentName && req.studentName.toLowerCase().includes(q));
      const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [requests, searchQuery, statusFilter]);

  const handleApprove = async (reqId) => {
    try {
      await requestService.approveRequest(reqId);
      showToast('Request approved successfully.', 'success');
      setViewingRequest(null);
      loadRequests();
    } catch (err) {
      showToast(`Error approving request: ${err.message}`, 'error');
    }
  };

  const handleReject = async (reqId) => {
    try {
      await requestService.rejectRequest(reqId);
      showToast('Request rejected.', 'success');
      setViewingRequest(null);
      loadRequests();
    } catch (err) {
      showToast(`Error rejecting request: ${err.message}`, 'error');
    }
  };

  const columns = [
    {
      title: 'Student',
      key: 'studentName',
      render: (val) => <strong>{val}</strong>,
    },
    { title: 'Request Date', key: 'requestDate' },
    {
      title: 'Status',
      key: 'status',
      render: (val) => <StatusBadge status={val} />,
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, req) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className="admin-action-btn"
            onClick={() => setViewingRequest(req)}
            title="View"
          >
            <Icon name="eye" size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Manage Transport Requests</h1>
          <p>Review and approve student transport requests.</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <StatCard title="Pending" value={pendingCount} icon="clock" />
        <StatCard title="Approved" value={approvedCount} icon="check-circle" />
        <StatCard title="Rejected" value={rejectedCount} icon="x-circle" />
      </div>

      <div className="admin-controls-bar">
        <div className="admin-filters-group">
          <div className="admin-search-input-wrap">
            <Icon name="search" size={16} />
            <input
              type="search"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div><p>Loading...</p></div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredRequests}
          keyField="_id"
          emptyMessage="No requests found."
        />
      )}

      {viewingRequest && (
        <AdminModal
          open={true}
          title="Request Details"
          onClose={() => setViewingRequest(null)}
          footer={
            <>
              {viewingRequest.status === 'Pending' && (
                <>
                  <button
                    type="button"
                    className="admin-btn admin-btn-danger"
                    onClick={() => handleReject(viewingRequest._id)}
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn-primary"
                    onClick={() => handleApprove(viewingRequest._id)}
                  >
                    Approve
                  </button>
                </>
              )}
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setViewingRequest(null)}
              >
                Close
              </button>
            </>
          }
        >
          <dl className="admin-info-dl">
            <dt>Student Name:</dt>
            <dd><strong>{viewingRequest.studentName}</strong></dd>
            <dt>Status:</dt>
            <dd><StatusBadge status={viewingRequest.status} /></dd>
            <dt>Request Date:</dt>
            <dd>{viewingRequest.requestDate}</dd>
          </dl>
        </AdminModal>
      )}
    </div>
  );
}

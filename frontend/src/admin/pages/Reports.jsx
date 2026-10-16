import { useState, useEffect } from 'react';
import DataTable from '../components/DataTable';
import Icon from '../../common/components/Icon';
import { useAdminToast } from '../context/AdminToastContext';
import { reportService } from '../services/reportService';

export default function Reports() {
  const { showToast } = useAdminToast();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const response = await reportService.getReports(1, 100);
      setReports(response.data || []);
    } catch (err) {
      showToast(`Error loading reports: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Report Type', key: 'type' },
    { title: 'Generated Date', key: 'generatedDate' },
    { title: 'Description', key: 'description' },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <button type="button" className="admin-btn admin-btn-sm admin-btn-primary">
          <Icon name="download" size={14} />
          Download
        </button>
      ),
    },
  ];

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Reports</h1>
          <p>System reports and analytics.</p>
        </div>
      </div>

      {loading ? <div><p>Loading...</p></div> : <DataTable columns={columns} data={reports} keyField="_id" emptyMessage="No reports available." />}
    </div>
  );
}

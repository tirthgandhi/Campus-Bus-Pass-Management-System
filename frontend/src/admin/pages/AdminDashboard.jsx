import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import Icon from '../../common/components/Icon';
import { useAdminToast } from '../context/AdminToastContext';
import { dashboardService } from '../services/dashboardService';

export default function AdminDashboard() {
  const { showToast } = useAdminToast();
  const [dashboard, setDashboard] = useState({
    totalStudents: 0,
    totalBuses: 0,
    totalDrivers: 0,
    totalRoutes: 0,
    activeRoutes: 0,
    pendingRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardService.getDashboard();
      setDashboard(response.data || {});
    } catch (err) {
      showToast(`Error loading dashboard: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-page-container"><p>Loading dashboard...</p></div>;

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <div className="admin-page-header-text">
          <h1>Admin Dashboard</h1>
          <p>Campus Bus Pass Management System - Overview</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <StatCard title="Total Students" value={dashboard.totalStudents} icon="users" />
        <StatCard title="Total Buses" value={dashboard.totalBuses} icon="bus" />
        <StatCard title="Active Drivers" value={dashboard.totalDrivers} icon="user-check" />
        <StatCard title="Active Routes" value={dashboard.activeRoutes} icon="map" />
        <StatCard title="All Routes" value={dashboard.totalRoutes} icon="route" />
        <StatCard title="Pending Requests" value={dashboard.pendingRequests} icon="inbox" />
      </div>
    </div>
  );
}

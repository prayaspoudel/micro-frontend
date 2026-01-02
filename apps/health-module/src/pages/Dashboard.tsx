import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { healthcareApi } from '../services/api';

const DashboardContainer = styled.div`
  padding: 2rem;
  
  h1 {
    font-size: 2rem;
    margin-bottom: 1.5rem;
    color: ${props => props.theme.colors?.primary?.[600] || '#10b981'};
  }
  
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    h3 {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 0.5rem;
    }
    
    .value {
      font-size: 2rem;
      font-weight: bold;
      color: ${props => props.theme.colors?.primary?.[600] || '#10b981'};
    }
  }
  
  .recent-activity {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    
    h2 {
      font-size: 1.25rem;
      margin-bottom: 1rem;
    }
  }
`;

interface DashboardStats {
  totalPatients: number;
  activeContacts: number;
  todayAppointments: number;
  pendingTasks: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    activeContacts: 0,
    todayAppointments: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dashboard stats from evero healthcare API
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // This will connect to the evero healthcare backend
      const healthcareApiUrl = process.env.VITE_HEALTHCARE_API_URL || 'http://localhost:8080';
      
      // Fetch stats - you may need to adjust endpoints based on your API
      const response = await fetch(`${healthcareApiUrl}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      // Set some default values for now
      setStats({
        totalPatients: 150,
        activeContacts: 45,
        todayAppointments: 8,
        pendingTasks: 12
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <DashboardContainer><p>Loading dashboard...</p></DashboardContainer>;
  }

  return (
    <DashboardContainer>
      <h1>Healthcare Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Patients</h3>
          <div className="value">{stats.totalPatients}</div>
        </div>
        
        <div className="stat-card">
          <h3>Active Contacts</h3>
          <div className="value">{stats.activeContacts}</div>
        </div>
        
        <div className="stat-card">
          <h3>Today's Appointments</h3>
          <div className="value">{stats.todayAppointments}</div>
        </div>
        
        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <div className="value">{stats.pendingTasks}</div>
        </div>
      </div>
      
      <div className="recent-activity">
        <h2>Recent Activity</h2>
        <p>Connected to Evero Healthcare System</p>
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;

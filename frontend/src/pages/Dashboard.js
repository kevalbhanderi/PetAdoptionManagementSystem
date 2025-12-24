import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="container">
      <div className="card fade-in">
        <h1 style={{ 
          color: '#333',
          fontSize: '2.5em',
          marginBottom: '20px'
        }}>
          Welcome, {user.name}! 👋
        </h1>
        <div className="dashboard-info">
          <p><strong>Email:</strong> {user.email}</p>
          {user.phone && <p><strong>Phone:</strong> {user.phone}</p>}
          {user.address && <p><strong>Address:</strong> {user.address}</p>}
          <p><strong>Role:</strong> <span className="status-badge status-available">{user.role}</span></p>
        </div>
        <div style={{ marginTop: '30px' }}>
          <a href="/my-applications" className="btn btn-primary">
            View My Applications
          </a>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './MyApplications.css';

const MyApplications = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await axios.get('/api/applications');
      setApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (id) => {
    if (window.confirm('Are you sure you want to withdraw this application?')) {
      try {
        await axios.delete(`/api/applications/${id}`);
        fetchApplications();
      } catch (error) {
        console.error('Error withdrawing application:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ 
        color: '#333',
        fontSize: '2.5em',
        marginBottom: '20px',
        animation: 'slideInLeft 0.5s ease-out'
      }}>
        My Applications
      </h1>
      {applications.length === 0 ? (
        <div className="card">
          <p>You haven't submitted any applications yet.</p>
          <Link to="/" className="btn btn-primary">Browse Pets</Link>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map(app => (
            <div key={app._id} className="application-card">
              <div className="application-header">
                <Link to={`/pet/${app.pet._id}`} className="application-pet-link">
                  <h3>{app.pet.name}</h3>
                </Link>
                <span className={`status-badge status-${app.status.toLowerCase()}`}>
                  {app.status}
                </span>
              </div>
              <div className="application-info">
                <p><strong>Pet:</strong> {app.pet.species} - {app.pet.breed || 'Mixed'}</p>
                <p><strong>Applied on:</strong> {new Date(app.applicationDate).toLocaleDateString()}</p>
                <p><strong>Message:</strong> {app.message}</p>
                {app.reviewNotes && (
                  <p><strong>Review Notes:</strong> {app.reviewNotes}</p>
                )}
              </div>
              {app.status === 'Pending' && (
                <button
                  onClick={() => handleWithdraw(app._id)}
                  className="btn btn-danger"
                >
                  Withdraw Application
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;


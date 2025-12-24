import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './PetDetail.css';

const PetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    message: '',
    livingSituation: '',
    experience: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPet();
  }, [id]);

  const fetchPet = async () => {
    try {
      const res = await axios.get(`/api/pets/${id}`);
      setPet(res.data);
    } catch (error) {
      console.error('Error fetching pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationChange = (e) => {
    setApplicationData({
      ...applicationData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const res = await axios.post('/api/applications', {
        pet: id,
        ...applicationData
      });
      setSuccess('Application submitted successfully!');
      setShowApplicationForm(false);
      fetchPet(); // Refresh pet data to update status
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit application');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading pet details...</p>
      </div>
    );
  }

  if (!pet) {
    return <div className="container">Pet not found</div>;
  }

  return (
    <div className="container">
      <div className="pet-detail">
        <div className="pet-detail-image">
          {pet.image ? (
            <img src={pet.image} alt={pet.name} />
          ) : (
            <div className="pet-placeholder-large">🐾</div>
          )}
        </div>
        <div className="pet-detail-info">
          <h1>{pet.name}</h1>
          <div className="pet-detail-meta">
            <p><strong>Species:</strong> {pet.species}</p>
            <p><strong>Breed:</strong> {pet.breed || 'Mixed'}</p>
            <p><strong>Age:</strong> {pet.age} years</p>
            <p><strong>Gender:</strong> {pet.gender}</p>
            <p><strong>Size:</strong> {pet.size}</p>
            <p><strong>Color:</strong> {pet.color || 'N/A'}</p>
            <p><strong>Location:</strong> {pet.location || 'N/A'}</p>
            <span className={`status-badge status-${pet.status.toLowerCase()}`}>
              {pet.status}
            </span>
          </div>
          <div className="pet-detail-description">
            <h2>Description</h2>
            <p>{pet.description}</p>
          </div>
          {pet.medicalHistory && (
            <div className="pet-detail-section">
              <h2>Medical History</h2>
              <p>{pet.medicalHistory}</p>
            </div>
          )}
          {pet.specialNeeds && (
            <div className="pet-detail-section">
              <h2>Special Needs</h2>
              <p>{pet.specialNeeds}</p>
            </div>
          )}
          {pet.status === 'Available' && user && user.role === 'adopter' && (
            <div className="pet-detail-actions">
              <button
                onClick={() => setShowApplicationForm(!showApplicationForm)}
                className="btn btn-primary"
              >
                Apply for Adoption
              </button>
            </div>
          )}
          {showApplicationForm && (
            <div className="application-form">
              <h2>Adoption Application</h2>
              {error && <div className="error">{error}</div>}
              {success && <div className="success">{success}</div>}
              <form onSubmit={handleSubmitApplication}>
                <div className="form-group">
                  <label>Why do you want to adopt this pet?</label>
                  <textarea
                    name="message"
                    value={applicationData.message}
                    onChange={handleApplicationChange}
                    required
                    placeholder="Tell us about why you want to adopt this pet..."
                  />
                </div>
                <div className="form-group">
                  <label>Living Situation</label>
                  <textarea
                    name="livingSituation"
                    value={applicationData.livingSituation}
                    onChange={handleApplicationChange}
                    required
                    placeholder="Describe your living situation (house, apartment, etc.)"
                  />
                </div>
                <div className="form-group">
                  <label>Previous Pet Experience</label>
                  <textarea
                    name="experience"
                    value={applicationData.experience}
                    onChange={handleApplicationChange}
                    required
                    placeholder="Tell us about your experience with pets..."
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  Submit Application
                </button>
                <button
                  type="button"
                  onClick={() => setShowApplicationForm(false)}
                  className="btn btn-secondary"
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PetDetail;


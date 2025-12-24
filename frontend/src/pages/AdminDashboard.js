import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('pets');
  const [showPetForm, setShowPetForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [petFormData, setPetFormData] = useState({
    name: '',
    species: 'Dog',
    breed: '',
    age: '',
    gender: 'Male',
    size: 'Medium',
    color: '',
    description: '',
    location: '',
    medicalHistory: '',
    specialNeeds: '',
    status: 'Available'
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/');
    } else if (user && user.role === 'admin') {
      fetchPets();
      fetchApplications();
    }
  }, [user, loading, navigate]);

  const fetchPets = async () => {
    try {
      const res = await axios.get('/api/pets');
      setPets(res.data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axios.get('/api/applications');
      setApplications(res.data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handlePetFormChange = (e) => {
    setPetFormData({
      ...petFormData,
      [e.target.name]: e.target.value
    });
  };

  const handlePetSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPet) {
        await axios.put(`/api/pets/${editingPet._id}`, petFormData);
      } else {
        await axios.post('/api/pets', petFormData);
      }
      setShowPetForm(false);
      setEditingPet(null);
      resetPetForm();
      fetchPets();
    } catch (error) {
      console.error('Error saving pet:', error);
      alert('Error saving pet');
    }
  };

  const handleEditPet = (pet) => {
    setEditingPet(pet);
    setPetFormData({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age,
      gender: pet.gender,
      size: pet.size,
      color: pet.color || '',
      description: pet.description,
      location: pet.location || '',
      medicalHistory: pet.medicalHistory || '',
      specialNeeds: pet.specialNeeds || '',
      status: pet.status
    });
    setShowPetForm(true);
  };

  const handleDeletePet = async (id) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await axios.delete(`/api/pets/${id}`);
        fetchPets();
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    }
  };

  const handleApplicationStatus = async (id, status, reviewNotes = '') => {
    try {
      await axios.put(`/api/applications/${id}/status`, { status, reviewNotes });
      fetchApplications();
      fetchPets();
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const resetPetForm = () => {
    setPetFormData({
      name: '',
      species: 'Dog',
      breed: '',
      age: '',
      gender: 'Male',
      size: 'Medium',
      color: '',
      description: '',
      location: '',
      medicalHistory: '',
      specialNeeds: '',
      status: 'Available'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
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
        Admin Dashboard
      </h1>
      
      <div className="admin-tabs">
        <button
          className={activeTab === 'pets' ? 'active' : ''}
          onClick={() => setActiveTab('pets')}
        >
          Manage Pets
        </button>
        <button
          className={activeTab === 'applications' ? 'active' : ''}
          onClick={() => setActiveTab('applications')}
        >
          Manage Applications ({applications.filter(a => a.status === 'Pending').length})
        </button>
      </div>

      {activeTab === 'pets' && (
        <div>
          <button
            onClick={() => {
              setShowPetForm(true);
              setEditingPet(null);
              resetPetForm();
            }}
            className="btn btn-primary"
            style={{ marginBottom: '20px' }}
          >
            Add New Pet
          </button>

          {showPetForm && (
            <div className="card">
              <h2>{editingPet ? 'Edit Pet' : 'Add New Pet'}</h2>
              <form onSubmit={handlePetSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={petFormData.name}
                      onChange={handlePetFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Species *</label>
                    <select
                      name="species"
                      value={petFormData.species}
                      onChange={handlePetFormChange}
                      required
                    >
                      <option value="Dog">Dog</option>
                      <option value="Cat">Cat</option>
                      <option value="Bird">Bird</option>
                      <option value="Rabbit">Rabbit</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Breed</label>
                    <input
                      type="text"
                      name="breed"
                      value={petFormData.breed}
                      onChange={handlePetFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Age (years) *</label>
                    <input
                      type="number"
                      name="age"
                      value={petFormData.age}
                      onChange={handlePetFormChange}
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Gender *</label>
                    <select
                      name="gender"
                      value={petFormData.gender}
                      onChange={handlePetFormChange}
                      required
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Unknown">Unknown</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Size *</label>
                    <select
                      name="size"
                      value={petFormData.size}
                      onChange={handlePetFormChange}
                      required
                    >
                      <option value="Small">Small</option>
                      <option value="Medium">Medium</option>
                      <option value="Large">Large</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      name="color"
                      value={petFormData.color}
                      onChange={handlePetFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Status</label>
                    <select
                      name="status"
                      value={petFormData.status}
                      onChange={handlePetFormChange}
                    >
                      <option value="Available">Available</option>
                      <option value="Pending">Pending</option>
                      <option value="Adopted">Adopted</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={petFormData.description}
                    onChange={handlePetFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={petFormData.location}
                    onChange={handlePetFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Medical History</label>
                  <textarea
                    name="medicalHistory"
                    value={petFormData.medicalHistory}
                    onChange={handlePetFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Special Needs</label>
                  <textarea
                    name="specialNeeds"
                    value={petFormData.specialNeeds}
                    onChange={handlePetFormChange}
                  />
                </div>
                <button type="submit" className="btn btn-primary">
                  {editingPet ? 'Update Pet' : 'Add Pet'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPetForm(false);
                    setEditingPet(null);
                    resetPetForm();
                  }}
                  className="btn btn-secondary"
                  style={{ marginLeft: '10px' }}
                >
                  Cancel
                </button>
              </form>
            </div>
          )}

          <div className="pets-list">
            {pets.map(pet => (
              <div key={pet._id} className="pet-admin-card">
                <div className="pet-admin-header">
                  <h3>{pet.name}</h3>
                  <span className={`status-badge status-${pet.status.toLowerCase()}`}>
                    {pet.status}
                  </span>
                </div>
                <p><strong>Species:</strong> {pet.species} | <strong>Breed:</strong> {pet.breed || 'Mixed'} | <strong>Age:</strong> {pet.age} years</p>
                <div className="pet-admin-actions">
                  <button
                    onClick={() => handleEditPet(pet)}
                    className="btn btn-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePet(pet._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="applications-admin">
          {applications.length === 0 ? (
            <div className="card">
              <p>No applications found.</p>
            </div>
          ) : (
            applications.map(app => (
              <div key={app._id} className="application-admin-card">
                <div className="application-admin-header">
                  <div>
                    <h3>{app.pet.name}</h3>
                    <p><strong>Applicant:</strong> {app.applicant.name} ({app.applicant.email})</p>
                    <p><strong>Applied on:</strong> {new Date(app.applicationDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`status-badge status-${app.status.toLowerCase()}`}>
                    {app.status}
                  </span>
                </div>
                <div className="application-admin-details">
                  <p><strong>Message:</strong> {app.message}</p>
                  <p><strong>Living Situation:</strong> {app.livingSituation}</p>
                  <p><strong>Experience:</strong> {app.experience}</p>
                  {app.reviewNotes && (
                    <p><strong>Review Notes:</strong> {app.reviewNotes}</p>
                  )}
                </div>
                {app.status === 'Pending' && (
                  <div className="application-admin-actions">
                    <button
                      onClick={() => {
                        const notes = window.prompt('Add review notes (optional):');
                        handleApplicationStatus(app._id, 'Approved', notes || '');
                      }}
                      className="btn btn-primary"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const notes = window.prompt('Add review notes (optional):');
                        handleApplicationStatus(app._id, 'Rejected', notes || '');
                      }}
                      className="btn btn-danger"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;


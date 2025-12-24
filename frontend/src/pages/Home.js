import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/api';
import './Home.css';

const Home = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    species: '',
    status: 'Available',
    size: '',
    gender: '',
    search: ''
  });

  useEffect(() => {
    fetchPets();
  }, [filters]);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const res = await axios.get(`/api/pets?${params.toString()}`);
      setPets(res.data);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading pets...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="home-header">
        <h1>Find Your Perfect Pet Companion</h1>
        <p>Browse through our available pets and give them a loving home</p>
      </div>

      <div className="filters">
        <h2>Filter Pets</h2>
        <div className="filter-grid">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              name="search"
              placeholder="Search by name, breed..."
              value={filters.search}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>Species</label>
            <select name="species" value={filters.species} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Size</label>
            <select name="size" value={filters.size} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="Small">Small</option>
              <option value="Medium">Medium</option>
              <option value="Large">Large</option>
            </select>
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select name="gender" value={filters.gender} onChange={handleFilterChange}>
              <option value="">All</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pets-grid">
        {pets.length === 0 ? (
          <div className="no-pets">
            <p>No pets found matching your criteria.</p>
          </div>
        ) : (
          pets.map(pet => (
            <Link to={`/pet/${pet._id}`} key={pet._id} className="pet-card">
              <div className="pet-image">
                {pet.image ? (
                  <img src={pet.image} alt={pet.name} />
                ) : (
                  <div className="pet-placeholder">🐾</div>
                )}
              </div>
              <div className="pet-card-content">
                <h3>{pet.name}</h3>
                <p><strong>Species:</strong> {pet.species}</p>
                <p><strong>Breed:</strong> {pet.breed || 'Mixed'}</p>
                <p><strong>Age:</strong> {pet.age} years</p>
                <p><strong>Size:</strong> {pet.size}</p>
                <span className={`status-badge status-${pet.status.toLowerCase()}`}>
                  {pet.status}
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Home;


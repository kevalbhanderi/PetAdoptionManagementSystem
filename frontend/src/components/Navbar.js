import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🐾 Pet Adoption
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/">Home</Link></li>
          {user ? (
            <>
              {user.role === 'admin' && (
                <li><Link to="/admin">Admin Dashboard</Link></li>
              )}
              <li><Link to="/my-applications">My Applications</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
              <li>
                <span className="navbar-user">Welcome, {user.name}</span>
              </li>
              <li>
                <button onClick={handleLogout} className="btn btn-outline">
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;


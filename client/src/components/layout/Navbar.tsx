import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { currentUser, switchUser, personas } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="brand-section">
          <div className="brand-logo">🐕</div>
          <div className="brand-text">
            <h1>
              Dogfood 2026
              <span className="badge badge-offline">
                <span className="pulse-dot"></span>
                Offline SQLite
              </span>
            </h1>
            <p>Self-Hosted Hackathon Judging OS</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="nav-links">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            end
          >
            📊 Overview
          </NavLink>
          <NavLink
            to="/judging"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            ⚖️ Judge Portal
          </NavLink>
          <NavLink
            to="/results"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            🏆 Leaderboard
          </NavLink>
          <NavLink
            to="/admin/normalization"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            🔬 Normalization Lab
          </NavLink>
        </nav>

        {/* User Persona Switcher */}
        <div className="user-switcher">
          <span style={{ fontSize: '1.15rem' }}>{currentUser.avatar}</span>
          <div>
            <select
              value={currentUser.id}
              onChange={(e) => switchUser(e.target.value)}
              title="Switch demo persona"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.role.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
          <span
            className={`badge ${
              currentUser.role === 'admin'
                ? 'badge-danger'
                : currentUser.role === 'organizer'
                ? 'badge-warning'
                : currentUser.role === 'judge'
                ? 'badge-info'
                : 'badge-success'
            }`}
          >
            {currentUser.role}
          </span>
        </div>
      </div>
    </header>
  );
};

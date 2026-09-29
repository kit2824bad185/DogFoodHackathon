import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SubscriptionModal } from '../hackathon/SubscriptionModal';

export const Navbar: React.FC = () => {
  const { currentUser, switchUser, personas } = useAuth();
  const [showExplore, setShowExplore] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowExplore(false);
    }
  };

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/?cat=${encodeURIComponent(categoryName)}`);
    setShowExplore(false);
  };

  return (
    <>
      {/* Top Veyra Plus Announcement Bar */}
      <div className="top-announcement-bar">
        <div className="announcement-content">
          <span className="announcement-pill">LIVE</span>
          <span className="announcement-text">
            <strong>Veyra Hackathon PLUS:</strong> Unlimited access to 500+ global hackathons, 1-on-1 judge office hours, and $2.5M in prizes.
          </span>
          <button
            className="announcement-link-btn"
            onClick={() => setShowSubscription(true)}
          >
            Claim 7-Day Free Pass →
          </button>
        </div>
      </div>

      <header className="navbar">
        <div className="navbar-inner">
          {/* Brand Section */}
          <div className="brand-section">
            <Link to="/" className="brand-link">
              <div className="coursera-logo-emblem">
                <span className="c-symbol">veyra</span>
                <span className="hack-plus-badge">
                  HACKATHON <strong>PLUS</strong>
                </span>
              </div>
            </Link>

            {/* Explore Mega Dropdown Trigger */}
            <div className="explore-dropdown-container">
              <button
                type="button"
                className={`btn-explore-dropdown ${showExplore ? 'active' : ''}`}
                onClick={() => setShowExplore(!showExplore)}
                aria-expanded={showExplore}
              >
                <span>Explore Tracks</span>
                <span className="dropdown-chevron">{showExplore ? '▲' : '▼'}</span>
              </button>

              {showExplore && (
                <div className="explore-mega-menu" onMouseLeave={() => setShowExplore(false)}>
                  <div className="mega-menu-header">
                    <h4>Browse Hackathon Domains</h4>
                    <p>Select a track to view open competitions and rubrics</p>
                  </div>
                  <div className="mega-menu-grid">
                    <button
                      className="mega-menu-item"
                      onClick={() => handleCategoryClick('AI & Machine Learning')}
                    >
                      <span className="item-icon">🧠</span>
                      <div>
                        <strong>AI &amp; Machine Learning</strong>
                        <small>LLMs, Autonomous Agents &amp; Vision</small>
                      </div>
                    </button>
                    <button
                      className="mega-menu-item"
                      onClick={() => handleCategoryClick('Cloud & Systems')}
                    >
                      <span className="item-icon">☁️</span>
                      <div>
                        <strong>Cloud &amp; Offline Systems</strong>
                        <small>SQLite WAL, Serverless &amp; Microservices</small>
                      </div>
                    </button>
                    <button
                      className="mega-menu-item"
                      onClick={() => handleCategoryClick('BioTech & Health')}
                    >
                      <span className="item-icon">🧬</span>
                      <div>
                        <strong>BioTech &amp; Health AI</strong>
                        <small>Drug Discovery &amp; Genomic Models</small>
                      </div>
                    </button>
                    <button
                      className="mega-menu-item"
                      onClick={() => handleCategoryClick('FinTech & Trading')}
                    >
                      <span className="item-icon">📈</span>
                      <div>
                        <strong>FinTech &amp; Trading</strong>
                        <small>Quantitative Market Making &amp; De-Fi</small>
                      </div>
                    </button>
                    <button
                      className="mega-menu-item"
                      onClick={() => handleCategoryClick('Climate & CleanTech')}
                    >
                      <span className="item-icon">🌱</span>
                      <div>
                        <strong>Climate &amp; CleanTech</strong>
                        <small>Grid Forecasting &amp; Green Energy</small>
                      </div>
                    </button>
                    <button
                      className="mega-menu-item"
                      onClick={() => handleCategoryClick('Web3 & Cryptography')}
                    >
                      <span className="item-icon">🔒</span>
                      <div>
                        <strong>Web3 &amp; Cryptography</strong>
                        <small>Zero-Knowledge Proofs &amp; Privacy</small>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar (Coursera Style) */}
          <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="navbar-search-input"
              placeholder="Search 500+ Veyra hackathons, AI & systems tracks, skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  navigate('/');
                }}
              >
                ✕
              </button>
            )}
            <button type="submit" className="search-submit-btn">
              Search
            </button>
          </form>

          {/* Navigation Links */}
          <nav className="nav-links">
            <NavLink
              to="/"
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              end
            >
              🚀 Hackathons
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
              🔬 Normalization
            </NavLink>
          </nav>

          {/* Right Action Area: Switcher + Plus Button */}
          <div className="navbar-right-actions">
            {/* User Persona Switcher */}
            <div className="user-switcher-container">
              <span className="persona-avatar-icon">{currentUser.avatar}</span>
              <select
                className="persona-select-dropdown"
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

            {/* Plus Pass Upgrade Button */}
            <button
              type="button"
              className="btn-plus-upgrade"
              onClick={() => setShowSubscription(true)}
            >
              <span className="crown-icon">👑</span> Get Plus
            </button>
          </div>
        </div>
      </header>

      {/* Subscription Modal */}
      <SubscriptionModal
        isOpen={showSubscription}
        onClose={() => setShowSubscription(false)}
      />
    </>
  );
};

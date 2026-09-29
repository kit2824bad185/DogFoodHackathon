import React from 'react';
import type { Hackathon } from '../../data/hackathonsData';

interface HackathonCardProps {
  hackathon: Hackathon;
  onSelect: (hackathon: Hackathon) => void;
  onRegister: (hackathon: Hackathon) => void;
}

export const HackathonCard: React.FC<HackathonCardProps> = ({
  hackathon,
  onSelect,
  onRegister,
}) => {
  return (
    <div className="coursera-card">
      {/* Banner / Card Top */}
      <div
        className="coursera-card-banner"
        style={{ background: hackathon.bannerGradient }}
        onClick={() => onSelect(hackathon)}
      >
        <div className="card-top-badges">
          {hackathon.isPlusIncluded && (
            <span className="badge-coursera-plus">
              <span className="plus-star">★</span> PLUS PASS
            </span>
          )}
          <span
            className={`badge-status ${
              hackathon.status === 'active'
                ? 'status-active'
                : hackathon.status === 'judging'
                ? 'status-judging'
                : hackathon.status === 'upcoming'
                ? 'status-upcoming'
                : 'status-completed'
            }`}
          >
            {hackathon.status === 'active' && '● LIVE NOW'}
            {hackathon.status === 'judging' && '⚖️ IN JUDGING'}
            {hackathon.status === 'upcoming' && '⏳ UPCOMING'}
            {hackathon.status === 'completed' && '✓ RESULTS OUT'}
          </span>
        </div>

        <div className="card-banner-center">
          <div className="org-icon-badge">{hackathon.orgLogo}</div>
          <span className="card-org-name">{hackathon.organization}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="coursera-card-body">
        {/* Rating and Students enrolled */}
        <div className="card-meta-row">
          <span className="card-rating">
            <span className="star-icon">★</span> {hackathon.rating.toFixed(2)}
          </span>
          <span className="card-reviews">({hackathon.reviewsCount} reviews)</span>
          <span className="card-dot">•</span>
          <span className="card-enrolled">{hackathon.enrolledCount.toLocaleString()} hackers</span>
        </div>

        {/* Title */}
        <h3 className="card-title" onClick={() => onSelect(hackathon)} title={hackathon.title}>
          {hackathon.title}
        </h3>

        {/* Subtitle snippet */}
        <p className="card-subtitle">{hackathon.subtitle}</p>

        {/* Skills Tag Pills */}
        <div className="card-skills-row">
          {hackathon.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="skill-pill">
              {skill}
            </span>
          ))}
          {hackathon.skills.length > 3 && (
            <span className="skill-pill-more">+{hackathon.skills.length - 3}</span>
          )}
        </div>

        {/* Prize Pool Highlight Box */}
        <div className="card-prize-box">
          <div className="prize-main">
            <span className="prize-icon">🏆</span>
            <div>
              <span className="prize-label">Total Prize Pool</span>
              <div className="prize-value">{hackathon.prizePool}</div>
            </div>
          </div>
          <div className="prize-sub">
            <span className="first-place-tag">1st: {hackathon.firstPlace}</span>
          </div>
        </div>

        {/* Footer info: Team size & days remaining */}
        <div className="card-footer-info">
          <span className="card-info-item">
            <span>👥</span> {hackathon.teamSize}
          </span>
          <span className="card-info-item">
            <span>⏱️</span> {hackathon.daysLeft > 0 ? `${hackathon.daysLeft} days left` : 'Finalizing'}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="card-actions">
          <button
            type="button"
            className="btn-card-outline"
            onClick={() => onSelect(hackathon)}
          >
            Overview &amp; Rubric
          </button>
          <button
            type="button"
            className="btn-card-primary"
            onClick={() => onRegister(hackathon)}
          >
            {hackathon.status === 'judging' ? 'View Standings' : 'Register Free'}
          </button>
        </div>
      </div>
    </div>
  );
};

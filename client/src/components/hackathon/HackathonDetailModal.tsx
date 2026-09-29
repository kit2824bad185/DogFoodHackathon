import React, { useState } from 'react';
import type { Hackathon } from '../../data/hackathonsData';

interface HackathonDetailModalProps {
  hackathon: Hackathon | null;
  onClose: () => void;
  onEnrollSuccess: (hackathon: Hackathon, teamData: any) => void;
}

export const HackathonDetailModal: React.FC<HackathonDetailModalProps> = ({
  hackathon,
  onClose,
  onEnrollSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rubrics' | 'mentors' | 'register'>('overview');
  
  // Registration form state
  const [teamName, setTeamName] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [captainEmail, setCaptainEmail] = useState('');
  const [trackChoice, setTrackChoice] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!hackathon) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !captainEmail.trim()) {
      setFormError('Please enter a team name and captain email address.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onEnrollSuccess(hackathon, {
        teamName,
        projectTitle: projectTitle || `${teamName}'s Hackathon Project`,
        captainEmail,
        track: trackChoice || hackathon.track,
        githubUrl,
      });
    }, 600);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header Hero */}
        <div className="drawer-header" style={{ background: hackathon.bannerGradient }}>
          <button className="drawer-close-btn" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
          <div className="drawer-header-content">
            <div className="drawer-badge-group">
              <span className="badge-coursera-plus">
                <span className="plus-star">★</span> VEYRA PLUS ELITE
              </span>
              <span className="drawer-track-tag">{hackathon.category}</span>
            </div>
            <h2 className="drawer-title">{hackathon.title}</h2>
            <p className="drawer-org">Organized by {hackathon.organization} {hackathon.orgLogo}</p>

            <div className="drawer-stats-row">
              <div className="drawer-stat">
                <span className="stat-num">{hackathon.prizePool}</span>
                <span className="stat-desc">Prize Pool</span>
              </div>
              <div className="drawer-stat">
                <span className="stat-num">{hackathon.rating.toFixed(2)} ★</span>
                <span className="stat-desc">{hackathon.reviewsCount} Judge Ratings</span>
              </div>
              <div className="drawer-stat">
                <span className="stat-num">{hackathon.enrolledCount.toLocaleString()}</span>
                <span className="stat-desc">Hackers Enrolled</span>
              </div>
              <div className="drawer-stat">
                <span className="stat-num">{hackathon.daysLeft > 0 ? `${hackathon.daysLeft}d` : 'Final'}</span>
                <span className="stat-desc">Time Remaining</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="drawer-nav-tabs">
          <button
            className={`drawer-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📋 Overview &amp; Challenge
          </button>
          <button
            className={`drawer-tab-btn ${activeTab === 'rubrics' ? 'active' : ''}`}
            onClick={() => setActiveTab('rubrics')}
          >
            ⚖️ Scoring Rubrics &amp; Weights
          </button>
          <button
            className={`drawer-tab-btn ${activeTab === 'mentors' ? 'active' : ''}`}
            onClick={() => setActiveTab('mentors')}
          >
            👨‍🏫 Mentors &amp; Judges ({hackathon.mentors.length})
          </button>
          <button
            className={`drawer-tab-btn tab-highlight ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            🚀 Register Team
          </button>
        </div>

        {/* Content Body */}
        <div className="drawer-body">
          {activeTab === 'overview' && (
            <div className="drawer-tab-pane">
              <div className="info-section">
                <h3>About This Hackathon</h3>
                <p className="lead-text">{hackathon.description}</p>
              </div>

              <div className="info-section">
                <h3>Primary Track &amp; Challenge Scope</h3>
                <div className="track-highlight-card">
                  <div className="track-icon">🎯</div>
                  <div>
                    <h4>{hackathon.track}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                      Build functional prototypes addressing real-world pain points in this specialization. Submissions are judged under strict Z-score normalized criteria.
                    </p>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>Prize Breakdown</h3>
                <div className="prize-tiers-grid">
                  <div className="prize-tier-card gold">
                    <span className="tier-medal">🥇 1st Place</span>
                    <span className="tier-value">{hackathon.firstPlace}</span>
                  </div>
                  <div className="prize-tier-card silver">
                    <span className="tier-medal">🥈 2nd Place</span>
                    <span className="tier-value">30% of Remaining Pool + Cloud Credits</span>
                  </div>
                  <div className="prize-tier-card bronze">
                    <span className="tier-medal">🥉 3rd Place</span>
                    <span className="tier-value">20% of Pool + Verified Certificate</span>
                  </div>
                </div>
              </div>

              <div className="info-section">
                <h3>Recommended Tech Stack &amp; Skills</h3>
                <div className="skills-badge-list">
                  {hackathon.skills.map((s) => (
                    <span key={s} className="skill-chip">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="info-section">
                <h3>Eligibility &amp; Team Rules</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {hackathon.eligibility} Teams can range from <strong>{hackathon.teamSize}</strong>. All intellectual property remains 100% with the participating hackers.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'rubrics' && (
            <div className="drawer-tab-pane">
              <div className="info-section">
                <h3>Judging Philosophy &amp; Mathematical Normalization</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
                  Submissions are graded blindly across independent judges. Scores are automatically normalized using the <strong>Standard Normal Z-Score formula</strong> (<code>Z = (X - μ) / σ</code>) to eliminate judge leniency and strictness bias.
                </p>

                <div className="rubric-cards-list">
                  {hackathon.rubrics.map((r, i) => (
                    <div key={i} className="rubric-item-card">
                      <div className="rubric-header">
                        <span className="rubric-name">{r.criterion}</span>
                        <span className="rubric-weight-badge">{r.weight} Weight</span>
                      </div>
                      <p className="rubric-desc">{r.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="integrity-guarantee-box">
                <span className="integrity-icon">🛡️</span>
                <div>
                  <h4>Zero Bias Integrity Guarantee</h4>
                  <p>
                    Judges never see other judges' scorecards before submitting. Any reported conflicts of interest immediately re-route the submission to alternate verified evaluators.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'mentors' && (
            <div className="drawer-tab-pane">
              <div className="info-section">
                <h3>Verified Industry Judges &amp; Mentors</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Hackathon Plus members get direct access to 1-on-1 office hours and written feedback from these engineering leads:
                </p>

                <div className="mentors-grid">
                  {hackathon.mentors.map((m, idx) => (
                    <div key={idx} className="mentor-card">
                      <div className="mentor-avatar">{m.avatar}</div>
                      <div className="mentor-details">
                        <h4>{m.name}</h4>
                        <span className="mentor-role">{m.role}</span>
                        <span className="mentor-company">@{m.company}</span>
                      </div>
                      <button
                        className="btn-mentor-book"
                        onClick={() => alert(`1-on-1 Office Hour booking with ${m.name} is included with your Veyra Hackathon Plus pass!`)}
                      >
                        Book Office Hours
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'register' && (
            <div className="drawer-tab-pane">
              <div className="register-form-container">
                <div className="form-header-box">
                  <h3>Enroll Your Team for {hackathon.title}</h3>
                  <p>
                    Entry is 100% free. Fill out your team information to claim your hacker pass and unlock submission portals.
                  </p>
                </div>

                {formError && <div className="alert-error-box">{formError}</div>}

                <form onSubmit={handleRegisterSubmit} className="interactive-enroll-form">
                  <div className="form-field-group">
                    <label>Team Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Neural Pioneers, ByteForge"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Captain / Primary Contact Email *</label>
                    <input
                      type="email"
                      placeholder="captain@hackathon.dev"
                      value={captainEmail}
                      onChange={(e) => setCaptainEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Project Title / Working Concept</label>
                    <input
                      type="text"
                      placeholder="e.g. EcoPulse: Real-Time Grid Monitoring"
                      value={projectTitle}
                      onChange={(e) => setProjectTitle(e.target.value)}
                    />
                  </div>

                  <div className="form-field-group">
                    <label>Challenge Track</label>
                    <select
                      value={trackChoice}
                      onChange={(e) => setTrackChoice(e.target.value)}
                    >
                      <option value="">{hackathon.track} (Default Track)</option>
                      <option value="Open Innovation & Systems">Open Innovation &amp; Systems</option>
                      <option value="Best Use of AI / Automation">Best Use of AI / Automation</option>
                      <option value="Best UX Polish & Accessibility">Best UX Polish &amp; Accessibility</option>
                    </select>
                  </div>

                  <div className="form-field-group">
                    <label>GitHub Repository / Monorepo Link (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://github.com/username/project"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                    />
                  </div>

                  <div className="form-benefits-reminder">
                    <span>✨ Included with your Free Enrollment:</span>
                    <ul>
                      <li>Instant submission access &amp; real-time test runs</li>
                      <li>Free API sandbox credentials from event sponsors</li>
                      <li>Leaderboard inclusion &amp; official digital participation certificate</li>
                    </ul>
                  </div>

                  <button
                    type="submit"
                    className="btn-submit-registration"
                    disabled={submitting}
                  >
                    {submitting ? 'Registering Team...' : 'Confirm & Claim Free Hacker Pass →'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="drawer-footer">
          <div className="footer-left-info">
            <span className="price-tag-free">FREE ENROLLMENT</span>
            <span className="price-tag-sub">Included with Veyra Hackathon Plus</span>
          </div>
          <div className="footer-right-buttons">
            <button className="btn-secondary" onClick={onClose}>
              Close
            </button>
            {activeTab !== 'register' && (
              <button
                className="btn-primary"
                onClick={() => setActiveTab('register')}
              >
                Enroll Now Free →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

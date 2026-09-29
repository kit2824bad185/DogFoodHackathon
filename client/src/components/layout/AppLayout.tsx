import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Navbar } from './Navbar';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>

      {/* Coursera-Style Multi-Column Footer */}
      <footer className="coursera-footer">
        <div className="footer-top-strip">
          <div className="footer-container">
            <div className="trust-partners-row">
              <span className="trust-label">Official University &amp; Technology Partners:</span>
              <div className="partners-badges-list">
                <span className="partner-chip">🏛️ Stanford University</span>
                <span className="partner-chip">🧠 Google DeepMind</span>
                <span className="partner-chip">🏛️ MIT Energy Initiative</span>
                <span className="partner-chip">☁️ Amazon Web Services</span>
                <span className="partner-chip">🚀 Y Combinator</span>
                <span className="partner-chip">📊 Wharton FinTech</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-main">
          <div className="footer-container footer-columns-grid">
            {/* Col 1 */}
            <div className="footer-col">
              <div className="footer-brand">
                <span className="footer-coursera-logo">veyra</span>
                <span className="footer-plus-tag">HACKATHON PLUS</span>
              </div>
              <p className="footer-mission">
                Veyra Hackathon Plus connects 120,000+ ambitious developers with high-stakes hackathons, world-renowned university rubrics, and real-time unbiased judging.
              </p>
              <div className="footer-stats-summary">
                <div>
                  <strong>$2,500,000+</strong>
                  <small>Prize Pools Awarded</small>
                </div>
                <div>
                  <strong>500+</strong>
                  <small>Verified Competitions</small>
                </div>
              </div>
            </div>

            {/* Col 2 */}
            <div className="footer-col">
              <h4>Hackathon Domains</h4>
              <ul>
                <li><Link to="/?cat=AI+%26+Machine+Learning">AI &amp; Generative Models</Link></li>
                <li><Link to="/?cat=Cloud+%26+Systems">Cloud &amp; Offline Systems</Link></li>
                <li><Link to="/?cat=BioTech+%26+Health">BioTech &amp; Computational Health</Link></li>
                <li><Link to="/?cat=FinTech+%26+Trading">FinTech &amp; Algorithmic Trading</Link></li>
                <li><Link to="/?cat=Climate+%26+CleanTech">Climate &amp; Clean Energy</Link></li>
                <li><Link to="/?cat=Web3+%26+Cryptography">Web3 &amp; Zero-Knowledge Proofs</Link></li>
              </ul>
            </div>

            {/* Col 3 */}
            <div className="footer-col">
              <h4>Judging &amp; Fairness OS</h4>
              <ul>
                <li><Link to="/judging">Live Judge Evaluation Portal</Link></li>
                <li><Link to="/results">Public Normalized Leaderboard</Link></li>
                <li><Link to="/admin/normalization">Z-Score Normalization Studio</Link></li>
                <li><a href="#rubrics">Weighted Multi-Criteria Rubrics</a></li>
                <li><a href="#blind-rls">Blind Row-Level Security (RLS)</a></li>
                <li><a href="#integrity">Conflict-of-Interest Governance</a></li>
              </ul>
            </div>

            {/* Col 4 */}
            <div className="footer-col">
              <h4>Veyra Plus Pass</h4>
              <ul>
                <li><a href="#plans">Unlimited Hackathons Pass</a></li>
                <li><a href="#masterclasses">Masterclasses &amp; Bootcamps</a></li>
                <li><a href="#credentials">Verified Builder Credentials</a></li>
                <li><a href="#recruiter">Recruiter Talent Pipeline</a></li>
                <li><a href="#enterprise">University &amp; Enterprise Teams</a></li>
                <li><a href="#faq">Frequently Asked Questions</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-container bottom-inner">
            <div className="copyright-text">
              &copy; {new Date().getFullYear()} Veyra Inc. &bull; Veyra Hackathon Platform &bull; All Rights Reserved.
            </div>
            <div className="footer-legal-links">
              <span>Privacy Policy</span>
              <span>•</span>
              <span>Terms of Participation</span>
              <span>•</span>
              <span>Honor Code &amp; Academic Integrity</span>
              <span>•</span>
              <span>Zero-Cloud SQLite Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

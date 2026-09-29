import React from 'react';
import type { Hackathon } from '../../data/hackathonsData';

interface EnrollmentConfirmationModalProps {
  hackathon: Hackathon | null;
  registrationData: any;
  onClose: () => void;
  onGoToJudging: () => void;
}

export const EnrollmentConfirmationModal: React.FC<EnrollmentConfirmationModalProps> = ({
  hackathon,
  registrationData,
  onClose,
  onGoToJudging,
}) => {
  if (!hackathon) return null;

  const ticketId = `PASS-${Math.floor(100000 + Math.random() * 900000)}`;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card-pass" onClick={(e) => e.stopPropagation()}>
        <div className="pass-confetti">🎉</div>
        <h2 className="pass-title">You're In! Registration Confirmed</h2>
        <p className="pass-subtitle">
          Your team has been officially registered for <strong>{hackathon.title}</strong>.
        </p>

        {/* Digital Pass Ticket Badge */}
        <div className="digital-ticket">
          <div className="ticket-header">
            <span className="ticket-logo">Veyra Hackathon <strong>PLUS</strong></span>
            <span className="ticket-id">{ticketId}</span>
          </div>
          <div className="ticket-content">
            <div className="ticket-row">
              <span className="ticket-label">Team Name</span>
              <span className="ticket-val">{registrationData?.teamName || 'Byte Pioneers'}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Project Concept</span>
              <span className="ticket-val">{registrationData?.projectTitle || 'Autonomous System'}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Track</span>
              <span className="ticket-val">{registrationData?.track || hackathon.track}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Captain Contact</span>
              <span className="ticket-val">{registrationData?.captainEmail || 'hacker@veyra.dev'}</span>
            </div>
          </div>
          <div className="ticket-footer">
            <span>🛡️ Verified Entry Pass</span>
            <span>Zero Cloud SQLite Verification</span>
          </div>
        </div>

        <div className="pass-perks">
          <div className="perk-item">
            <span>✅</span> Discord Hacker Channel Access Unlocked
          </div>
          <div className="perk-item">
            <span>✅</span> API Credits Credited to Your Account
          </div>
          <div className="perk-item">
            <span>✅</span> Submission Portal Open (Closes in {hackathon.daysLeft} days)
          </div>
        </div>

        <div className="pass-actions">
          <button className="btn-secondary" onClick={onClose}>
            Back to Catalog
          </button>
          <button className="btn-primary" onClick={onGoToJudging}>
            View Judging Portal →
          </button>
        </div>
      </div>
    </div>
  );
};

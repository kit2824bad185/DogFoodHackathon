import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import type { AssignmentDetailsResponse } from '../../types/judging';
import { getProjectInfo } from '../../utils/projects';

interface Props {
  assignmentId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const EvaluationModal: React.FC<Props> = ({ assignmentId, onClose, onSuccess }) => {
  const [details, setDetails] = useState<AssignmentDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Scoring state: criterionId -> value
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  // Conflict reporting state
  const [showConflictForm, setShowConflictForm] = useState(false);
  const [conflictReason, setConflictReason] = useState('');

  useEffect(() => {
    async function fetchAssignment() {
      try {
        setLoading(true);
        setError(null);
        const res: any = await apiClient.get(`/judging/assignments/${assignmentId}`);
        const data: AssignmentDetailsResponse = res.data;
        setDetails(data);

        // Prepopulate existing score items if draft/final exists
        if (data.score?.items) {
          const initialScores: Record<string, number> = {};
          const initialFeedback: Record<string, string> = {};
          for (const item of data.score.items) {
            initialScores[item.criterionId] = item.value;
            if (item.feedback) initialFeedback[item.criterionId] = item.feedback;
          }
          setScores(initialScores);
          setFeedbacks(initialFeedback);
        } else {
          // Initialize with default mid-point (5.0)
          const defaultScores: Record<string, number> = {};
          for (const c of data.rubric.criteria) {
            defaultScores[c.id] = 5.0;
          }
          setScores(defaultScores);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch assignment details');
      } finally {
        setLoading(false);
      }
    }
    fetchAssignment();
  }, [assignmentId]);

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading rubric and assignment data...</p>
        </div>
      </div>
    );
  }

  if (error || !details) {
    return (
      <div className="modal-overlay">
        <div className="modal-card">
          <h3 style={{ color: 'var(--color-danger)', marginBottom: '1rem' }}>Access Denied / Error</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const project = getProjectInfo(details.assignment.submissionId);
  const isLocked = details.score?.isFinal === true;
  const isConflict = details.assignment.status === 'conflict';

  // Real-time server-matching weighted calculation
  const totalWeightedRawScore = details.rubric.criteria.reduce((acc, c) => {
    const val = scores[c.id] || 0;
    return acc + val * c.weight;
  }, 0);

  const roundedWeightedScore = Math.round(totalWeightedRawScore * 100) / 100;

  const handleScoreChange = (criterionId: string, value: number) => {
    if (isLocked || isConflict) return;
    setScores((prev) => ({ ...prev, [criterionId]: value }));
  };

  const handleFeedbackChange = (criterionId: string, feedback: string) => {
    if (isLocked || isConflict) return;
    setFeedbacks((prev) => ({ ...prev, [criterionId]: feedback }));
  };

  const handleSubmit = async (isFinal: boolean) => {
    try {
      setSubmitting(true);
      setError(null);

      const items = details.rubric.criteria.map((c) => ({
        criterionId: c.id,
        value: scores[c.id] !== undefined ? scores[c.id] : 0,
        feedback: feedbacks[c.id] || null,
      }));

      await apiClient.put(`/judging/assignments/${assignmentId}/score`, {
        items,
        isFinal,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit score');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportConflict = async () => {
    if (!conflictReason.trim()) {
      setError('Please provide a specific reason for the conflict of interest.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await apiClient.post(`/judging/assignments/${assignmentId}/conflict`, {
        reason: conflictReason.trim(),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to report conflict');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <span style={{ fontSize: '1.5rem' }}>{project.avatar}</span>
              <h2 style={{ fontSize: '1.4rem', color: '#fff' }}>{project.title}</h2>
              <span className="badge badge-info">{project.category}</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Submission ID: <code>{details.assignment.submissionId}</code> &bull; Team: {project.team}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.5rem',
              cursor: 'pointer',
            }}
          >
            &times;
          </button>
        </div>

        {/* Lock Banner */}
        {isLocked && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              color: '#34d399',
              fontSize: '0.85rem',
            }}
          >
            🔒 <strong>Evaluation Finalized:</strong> This score has been finalized and locked immutably.
          </div>
        )}

        {/* Conflict Banner */}
        {isConflict && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.25rem',
              color: '#f87171',
              fontSize: '0.85rem',
            }}
          >
            ⚠️ <strong>Conflict of Interest Reported:</strong> This assignment is excused from evaluation.
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--color-danger)',
              color: '#f87171',
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '1rem',
              fontSize: '0.85rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Conflict Form View */}
        {showConflictForm ? (
          <div style={{ background: 'var(--bg-surface)', padding: '1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
            <h4 style={{ color: '#fff', marginBottom: '0.5rem' }}>Declare Conflict of Interest</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              If you have a personal, professional, or academic relationship with this team, declare it here to maintain evaluation integrity.
            </p>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="e.g., Former teammate or advised their team on this project..."
              value={conflictReason}
              onChange={(e) => setConflictReason(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <button
                className="btn btn-danger btn-sm"
                onClick={handleReportConflict}
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : 'Confirm Conflict'}
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowConflictForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Rubric Criteria List */
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: '0.25rem' }}>
                {details.rubric.name}
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                {details.rubric.description}
              </p>
            </div>

            {details.rubric.criteria.map((c) => {
              const val = scores[c.id] !== undefined ? scores[c.id] : 5.0;
              const weightedContribution = Math.round(val * c.weight * 100) / 100;

              return (
                <div key={c.id} className="slider-container">
                  <div className="slider-header">
                    <div>
                      <h4>{c.name}</h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {c.description} &bull; <strong>Weight: {c.weight}&times;</strong> (Max: {c.maxScore})
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="score-badge">{val.toFixed(1)}</span>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Weighted: +{weightedContribution}
                      </div>
                    </div>
                  </div>

                  {!isLocked && !isConflict && (
                    <input
                      type="range"
                      min={0}
                      max={c.maxScore}
                      step={0.5}
                      value={val}
                      onChange={(e) => handleScoreChange(c.id, parseFloat(e.target.value))}
                    />
                  )}

                  {!isLocked && !isConflict && (
                    <textarea
                      className="form-textarea"
                      rows={1}
                      placeholder="Optional feedback for this criterion..."
                      value={feedbacks[c.id] || ''}
                      onChange={(e) => handleFeedbackChange(c.id, e.target.value)}
                      style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                    />
                  )}
                </div>
              );
            })}

            {/* Total Weighted Preview Card */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.25rem',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 'var(--radius-md)',
                marginTop: '1.5rem',
                marginBottom: '1.5rem',
              }}
            >
              <div>
                <span style={{ fontSize: '0.8rem', color: '#818cf8', fontWeight: 600, textTransform: 'uppercase' }}>
                  Calculated Weighted Total (Server-Validated)
                </span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Formula: &Sigma;(value &times; weight) across {details.rubric.criteria.length} criteria
                </p>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#fff' }}>
                {roundedWeightedScore}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                {!isLocked && !isConflict && (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    style={{ color: '#f87171' }}
                    onClick={() => setShowConflictForm(true)}
                  >
                    🚩 Report Conflict
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={onClose}>
                  {isLocked ? 'Close' : 'Cancel'}
                </button>

                {!isLocked && !isConflict && (
                  <>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => handleSubmit(false)}
                      disabled={submitting}
                    >
                      {submitting ? 'Saving...' : '💾 Save Draft'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => handleSubmit(true)}
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : '🔒 Finalize Score'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { Assignment } from '../types/judging';
import { useAuth } from '../context/AuthContext';
import { getProjectInfo } from '../utils/projects';
import { EvaluationModal } from '../components/judging/EvaluationModal';

export const JudgingPortal: React.FC = () => {
  const { currentUser, switchUser } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'scored' | 'conflict'>('all');
  const [activeAssignmentId, setActiveAssignmentId] = useState<string | null>(null);

  const isJudge = currentUser.role === 'judge' || currentUser.role === 'admin';

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await apiClient.get('/judging/assignments');
      setAssignments(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isJudge) {
      fetchAssignments();
    }
  }, [currentUser]);

  if (!isJudge) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖️</div>
        <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Judge Workspace Access Required</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
          You are currently signed in as <strong>{currentUser.name}</strong> ({currentUser.role}).
          To access the blind assignment workspace and score projects, switch to a judge persona.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => switchUser('demo-judge-1')}
        >
          👩‍⚖️ Switch to Dr. Sarah Chen (Judge)
        </button>
      </div>
    );
  }

  const filteredAssignments = assignments.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  const pendingCount = assignments.filter((a) => a.status === 'pending').length;
  const scoredCount = assignments.filter((a) => a.status === 'scored').length;
  const conflictCount = assignments.filter((a) => a.status === 'conflict').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
            ⚖️ Judge Evaluation Portal
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Evaluating as: <strong>{currentUser.name}</strong> ({currentUser.title}) &bull; Blind Judging Mode Active
          </p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-secondary)', padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('all')}
          >
            All ({assignments.length})
          </button>
          <button
            className={`btn btn-sm ${filter === 'pending' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </button>
          <button
            className={`btn btn-sm ${filter === 'scored' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('scored')}
          >
            Scored ({scoredCount})
          </button>
          <button
            className={`btn btn-sm ${filter === 'conflict' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter('conflict')}
          >
            Conflicts ({conflictCount})
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid var(--color-danger)',
            color: '#f87171',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading your judging assignments...</p>
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>No assignments found for the selected filter.</p>
        </div>
      ) : (
        /* Assignment Grid */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.25rem',
          }}
        >
          {filteredAssignments.map((a) => {
            const project = getProjectInfo(a.submissionId);

            return (
              <div key={a.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{project.avatar}</span>
                      <div>
                        <h3 style={{ fontSize: '1.15rem', color: '#fff', lineHeight: 1.2 }}>{project.title}</h3>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{project.team}</span>
                      </div>
                    </div>

                    <span
                      className={`badge ${
                        a.status === 'scored'
                          ? 'badge-success'
                          : a.status === 'conflict'
                          ? 'badge-danger'
                          : 'badge-warning'
                      }`}
                    >
                      {a.status === 'scored' ? '✓ Finalized' : a.status === 'conflict' ? 'Conflict' : 'Pending Evaluation'}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                    {project.tagline}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    {a.score ? (
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          Raw Score:
                        </span>{' '}
                        <strong style={{ fontFamily: 'var(--font-mono)', color: '#34d399', fontSize: '1rem' }}>
                          {a.score.totalRawScore} pts
                        </strong>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ID: <code>{a.submissionId}</code>
                      </span>
                    )}
                  </div>

                  <button
                    className={`btn btn-sm ${a.status === 'scored' ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={() => setActiveAssignmentId(a.id)}
                  >
                    {a.status === 'scored' ? '🔍 Inspect Score' : a.status === 'conflict' ? 'View Details' : '✍️ Score Project'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Evaluation Modal */}
      {activeAssignmentId && (
        <EvaluationModal
          assignmentId={activeAssignmentId}
          onClose={() => setActiveAssignmentId(null)}
          onSuccess={() => {
            fetchAssignments();
          }}
        />
      )}
    </div>
  );
};

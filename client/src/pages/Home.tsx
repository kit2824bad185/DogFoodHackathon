import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const Home: React.FC = () => {
  const { currentUser } = useAuth();
  const [health, setHealth] = useState<any>(null);
  const [resultsCount, setResultsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const healthRes: any = await apiClient.get('/health');
        setHealth(healthRes.data);

        const resultsRes: any = await apiClient.get('/judging/results');
        if (resultsRes?.data) {
          setResultsCount(resultsRes.data.length);
        }
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div style={{ display: 'inline-flex', marginBottom: '1rem' }}>
          <span className="badge badge-info" style={{ padding: '0.35rem 0.85rem' }}>
            🚀 Dogfood 2026 Hackathon Platform
          </span>
        </div>
        <h1 className="hero-title">Offline Hackathon OS &amp; Judging Engine</h1>
        <p className="hero-subtitle">
          A high-integrity, offline-first hackathon platform powered by Node.js, Express, SQLite,
          and robust Z-Score statistical normalization.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/judging" className="btn btn-primary">
            ⚖️ Open Judge Portal
          </Link>
          <Link to="/results" className="btn btn-secondary">
            🏆 View Live Leaderboard
          </Link>
          <Link to="/admin/normalization" className="btn btn-secondary">
            🔬 Normalization Studio
          </Link>
        </div>
      </section>

      {/* KPI Stats */}
      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">Active Persona</span>
          <span className="stat-value" style={{ fontSize: '1.4rem', color: '#818cf8' }}>
            {currentUser.avatar} {currentUser.name}
          </span>
          <span className="stat-meta">Role: {currentUser.role.toUpperCase()}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">System Health</span>
          <span className="stat-value" style={{ color: '#10b981' }}>
            {loading ? '...' : health?.status === 'ok' ? 'HEALTHY' : 'OFFLINE'}
          </span>
          <span className="stat-meta">SQLite WAL &bull; v{health?.version || '1.0.0'}</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Ranked Projects</span>
          <span className="stat-value">{loading ? '...' : resultsCount}</span>
          <span className="stat-meta">Normalized Submissions</span>
        </div>

        <div className="stat-card">
          <span className="stat-label">Offline Integrity</span>
          <span className="stat-value" style={{ color: '#38bdf8' }}>
            100%
          </span>
          <span className="stat-meta">0 Cloud / External Network Calls</span>
        </div>
      </div>

      {/* Judging Architecture Visual Workflow */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#fff' }}>
          ⚖️ How Member 2 Judging Works
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Five architectural layers guarantee unbiased, mathematically sound, and tamper-proof evaluations:
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}
        >
          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>1️⃣</div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.35rem' }}>
              Blind Assignments
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Judges only see their assigned submissions. Row-Level Security blocks unauthorized viewing.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>2️⃣</div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.35rem' }}>
              Weighted Rubrics
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Server computes <code>rawScore = &Sigma;(val &times; weight)</code>. Client-calculated totals are never trusted.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>3️⃣</div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.35rem' }}>
              Score Immutability
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Drafts can be saved incrementally; finalized scores lock permanently and write an audit log.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>4️⃣</div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.35rem' }}>
              Z-Score Normalization
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Calculates judge mean (&mu;) &amp; std dev (&sigma;). Adjusts for harsh vs generous judges.
            </p>
          </div>

          <div
            style={{
              background: 'var(--bg-surface)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>5️⃣</div>
            <h4 style={{ color: '#fff', fontSize: '1rem', marginBottom: '0.35rem' }}>
              Deterministic Rank
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Ranks by normalized score &rarr; raw average &rarr; submissionId tie-breaker.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

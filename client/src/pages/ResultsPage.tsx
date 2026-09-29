import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import type { NormalizationResultItem } from '../types/judging';
import { getProjectInfo } from '../utils/projects';

export const ResultsPage: React.FC = () => {
  const [results, setResults] = useState<NormalizationResultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      const res: any = await apiClient.get('/judging/results');
      setResults(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard rankings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const filteredResults = results.filter((r) => {
    const project = getProjectInfo(r.submissionId);
    const search = searchTerm.toLowerCase();
    return (
      project.title.toLowerCase().includes(search) ||
      project.team.toLowerCase().includes(search) ||
      r.submissionId.toLowerCase().includes(search)
    );
  });

  const top1 = results.find((r) => r.rank === 1);
  const top2 = results.find((r) => r.rank === 2);
  const top3 = results.find((r) => r.rank === 3);

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            🏆 Official Hackathon Leaderboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Deterministically ranked using Z-score standardization: <code>clamp(50 + 10 &times; Z, 0, 100)</code>
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search projects or teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '0.5rem 0.85rem',
              fontSize: '0.85rem',
              outline: 'none',
              minWidth: '220px',
            }}
          />
          <button className="btn btn-secondary btn-sm" onClick={fetchResults}>
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Error Banner */}
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
          <p style={{ color: 'var(--text-secondary)' }}>Calculating standardized standings...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            No normalization results published yet. An organizer can run normalization from the Normalization Lab.
          </p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {!searchTerm && (
            <div className="podium-grid">
              {/* 2nd Place */}
              {top2 && (
                <div className="podium-card second">
                  <div className="podium-rank">🥈</div>
                  <span className="badge badge-secondary" style={{ marginBottom: '0.5rem' }}>
                    Rank #2
                  </span>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                    {getProjectInfo(top2.submissionId).avatar}
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem' }}>
                    {getProjectInfo(top2.submissionId).title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {getProjectInfo(top2.submissionId).team}
                  </p>
                  <div className="podium-score">{top2.finalNormalizedScore.toFixed(2)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Raw Avg: {top2.rawScoreAverage.toFixed(2)} &bull; Z: {top2.aggregateZScore.toFixed(3)}
                  </div>
                </div>
              )}

              {/* 1st Place */}
              {top1 && (
                <div className="podium-card first">
                  <div className="podium-rank">🥇</div>
                  <span className="badge badge-warning" style={{ marginBottom: '0.5rem' }}>
                    Grand Champion #1
                  </span>
                  <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>
                    {getProjectInfo(top1.submissionId).avatar}
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.35rem' }}>
                    {getProjectInfo(top1.submissionId).title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: '#fbbf24', marginBottom: '0.75rem' }}>
                    {getProjectInfo(top1.submissionId).team}
                  </p>
                  <div className="podium-score" style={{ color: '#fbbf24' }}>
                    {top1.finalNormalizedScore.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Raw Avg: {top1.rawScoreAverage.toFixed(2)} &bull; Z: {top1.aggregateZScore.toFixed(3)}
                  </div>
                </div>
              )}

              {/* 3rd Place */}
              {top3 && (
                <div className="podium-card third">
                  <div className="podium-rank">🥉</div>
                  <span className="badge badge-secondary" style={{ marginBottom: '0.5rem' }}>
                    Rank #3
                  </span>
                  <div style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
                    {getProjectInfo(top3.submissionId).avatar}
                  </div>
                  <h3 style={{ color: 'var(--text-primary)', fontSize: '1.15rem' }}>
                    {getProjectInfo(top3.submissionId).title}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {getProjectInfo(top3.submissionId).team}
                  </p>
                  <div className="podium-score">{top3.finalNormalizedScore.toFixed(2)}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Raw Avg: {top3.rawScoreAverage.toFixed(2)} &bull; Z: {top3.aggregateZScore.toFixed(3)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Full Results Table */}
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '80px', textAlign: 'center' }}>Rank</th>
                  <th>Project &amp; Team</th>
                  <th>Track Category</th>
                  <th style={{ width: '220px' }}>Final Normalized Score</th>
                  <th style={{ textAlign: 'right' }}>Raw Avg</th>
                  <th style={{ textAlign: 'right' }}>Aggregate Z-Score</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((res) => {
                  const project = getProjectInfo(res.submissionId);
                  const isTop = res.rank <= 3;

                  return (
                    <tr key={res.submissionId}>
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            background:
                              res.rank === 1
                                ? 'rgba(245, 158, 11, 0.2)'
                                : res.rank === 2
                                ? 'rgba(148, 163, 184, 0.2)'
                                : res.rank === 3
                                ? 'rgba(180, 83, 9, 0.2)'
                                : 'transparent',
                            color:
                              res.rank === 1
                                ? '#fbbf24'
                                : res.rank === 2
                                ? '#cbd5e1'
                                : res.rank === 3
                                ? '#f59e0b'
                                : 'var(--text-secondary)',
                          }}
                        >
                          {res.rank === 1 ? '🥇' : res.rank === 2 ? '🥈' : res.rank === 3 ? '🥉' : `#${res.rank}`}
                        </span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>{project.avatar}</span>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{project.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {project.team} &bull; <code>{res.submissionId}</code>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="badge badge-info">{project.category}</span>
                      </td>

                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div
                            style={{
                              flex: 1,
                              height: '8px',
                              background: '#e2e8f0',
                              borderRadius: '4px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${Math.min(100, Math.max(0, res.finalNormalizedScore))}%`,
                                height: '100%',
                                background:
                                  isTop
                                    ? 'linear-gradient(90deg, #6366f1, #10b981)'
                                    : 'var(--accent-gradient)',
                                borderRadius: '4px',
                              }}
                            />
                          </div>
                          <span
                            style={{
                              fontFamily: 'var(--font-mono)',
                              fontWeight: 700,
                              color: isTop ? '#059669' : 'var(--text-primary)',
                              minWidth: '45px',
                            }}
                          >
                            {res.finalNormalizedScore.toFixed(1)}
                          </span>
                        </div>
                      </td>

                      <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                        {res.rawScoreAverage.toFixed(2)}
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <span
                          className={`badge ${
                            res.aggregateZScore > 0
                              ? 'badge-success'
                              : res.aggregateZScore < 0
                              ? 'badge-warning'
                              : 'badge-info'
                          }`}
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          {res.aggregateZScore > 0 ? `+${res.aggregateZScore.toFixed(3)}` : res.aggregateZScore.toFixed(3)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { NormalizationRunResponse } from '../types/judging';

export const NormalizationStudio: React.FC = () => {
  const { currentUser, switchUser } = useAuth();
  const [eventId] = useState('event-dogfood-2026');
  const [minSampleCount, setMinSampleCount] = useState<number>(3);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestRun, setLatestRun] = useState<NormalizationRunResponse | null>(null);

  const isOrganizerOrAdmin = currentUser.role === 'organizer' || currentUser.role === 'admin';

  if (!isOrganizerOrAdmin) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
        <h2 style={{ color: '#fff', marginBottom: '0.75rem' }}>Organizer Privileges Required</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto 1.5rem' }}>
          Statistical Z-score normalization execution and judge calibration metrics are restricted to
          organizers and admins. Switch persona to test this tool.
        </p>
        <button
          className="btn btn-primary"
          onClick={() => switchUser('demo-organizer')}
        >
          📋 Switch to Alex Mercer (Organizer)
        </button>
      </div>
    );
  }

  const handleRunNormalization = async () => {
    try {
      setRunning(true);
      setError(null);
      const res: any = await apiClient.post('/judging/normalize', {
        eventId,
        minJudgeSampleCount: minSampleCount,
      });
      setLatestRun(res.data);
    } catch (err: any) {
      setError(err.message || 'Normalization run failed');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
          🔬 Normalization &amp; Calibration Lab
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Statistical Z-score standardization engine &bull; Active Organizer: <strong>{currentUser.name}</strong>
        </p>
      </div>

      {/* Control Panel Card */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1rem' }}>
          ⚡ Trigger Normalization Run
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.35rem', textTransform: 'uppercase', fontWeight: 600 }}>
              Event Target
            </label>
            <input
              type="text"
              readOnly
              value={eventId}
              style={{
                width: '100%',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '0.65rem 0.85rem',
                color: '#fff',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
                Min Judge Sample Count
              </label>
              <strong style={{ fontFamily: 'var(--font-mono)', color: '#818cf8' }}>
                {minSampleCount} projects
              </strong>
            </div>
            <input
              type="range"
              min={1}
              max={10}
              step={1}
              value={minSampleCount}
              onChange={(e) => setMinSampleCount(parseInt(e.target.value))}
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Judges with fewer than {minSampleCount} finalized evaluations will have Z-scores excluded to prevent statistical volatility.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleRunNormalization}
          disabled={running}
        >
          {running ? 'Running Calculations...' : '🚀 Execute Normalization Run'}
        </button>
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

      {/* Latest Run Results */}
      {latestRun && (
        <div>
          {/* Run Summary Meta */}
          <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: '0.25rem' }}>
                  ✓ Normalization Complete
                </span>
                <h3 style={{ color: '#fff', fontSize: '1.1rem' }}>Run ID: <code>{latestRun.runId}</code></h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Computed at: {new Date(latestRun.calculatedAt || Date.now()).toLocaleTimeString()} &bull;{' '}
                  {latestRun.results.length} submissions ranked
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Judges</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                    {latestRun.judgeStats.length}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ranked Teams</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#34d399' }}>
                    {latestRun.results.length}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Judge Calibration & Consistency Matrix */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: '#fff', marginBottom: '0.5rem' }}>
              📊 Judge Variance &amp; Scoring Calibration
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Shows statistical variance across evaluators. Z-Score normalization offsets individual leniency or severity.
            </p>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Judge Evaluator</th>
                    <th style={{ textAlign: 'center' }}>Evaluations Count</th>
                    <th style={{ textAlign: 'right' }}>Mean Score (&mu;)</th>
                    <th style={{ textAlign: 'right' }}>Standard Deviation (&sigma;)</th>
                    <th style={{ textAlign: 'center' }}>Tendency Classification</th>
                  </tr>
                </thead>
                <tbody>
                  {latestRun.judgeStats.map((j) => {
                    const isStrict = j.meanScore < 30;
                    const isLenient = j.meanScore > 37;

                    return (
                      <tr key={j.judgeId}>
                        <td>
                          <strong>{j.judgeId}</strong>
                        </td>
                        <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                          {j.sampleCount}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#fff' }}>
                          {j.meanScore.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: '#818cf8' }}>
                          &plusmn;{j.stdDev.toFixed(2)}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            className={`badge ${
                              isLenient
                                ? 'badge-warning'
                                : isStrict
                                ? 'badge-danger'
                                : 'badge-info'
                            }`}
                          >
                            {isLenient ? 'Lenient / Generous' : isStrict ? 'Critical / Harsh' : 'Calibrated / Balanced'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

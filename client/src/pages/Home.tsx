import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';

export const Home: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get('/health')
      .then(res => setHealth(res.data))
      .catch(err => setError(err.message || 'Failed to fetch health check'));
  }, []);

  return (
    <div>
      <h1>Dogfood 2026 Hackathon OS</h1>
      <p>Welcome to the local development environment.</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
        <h3>API Health Status</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {health ? (
          <pre>{JSON.stringify(health, null, 2)}</pre>
        ) : (
          <p>Loading health status...</p>
        )}
      </div>
    </div>
  );
};

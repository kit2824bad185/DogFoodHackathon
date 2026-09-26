import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export const AppLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '1rem', background: '#333', color: '#fff' }}>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Dogfood 2026</Link>
        </nav>
      </header>
      
      <main style={{ flex: 1, padding: '2rem' }}>
        <Outlet />
      </main>
      
      <footer style={{ padding: '1rem', background: '#eee', textAlign: 'center' }}>
        &copy; 2026 Dogfood Hackathon
      </footer>
    </div>
  );
};

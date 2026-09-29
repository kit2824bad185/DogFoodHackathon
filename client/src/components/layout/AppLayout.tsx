import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export const AppLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <strong>Dogfood 2026 Hackathon OS</strong> &bull; Member 2 Judging Engine
          </div>
          <div>
            Zero Cloud &bull; Local SQLite WAL &bull; Z-Score Normalization &bull; Blind Judging RLS
          </div>
        </div>
      </footer>
    </div>
  );
};

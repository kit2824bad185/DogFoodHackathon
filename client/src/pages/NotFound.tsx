import React from 'react';
import { Link } from 'react-router-dom';

export const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>404 - Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to="/">Go back home</Link>
    </div>
  );
};

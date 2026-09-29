import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Home } from './pages/Home';
import { JudgingPortal } from './pages/JudgingPortal';
import { ResultsPage } from './pages/ResultsPage';
import { NormalizationStudio } from './pages/NormalizationStudio';
import { NotFound } from './pages/NotFound';
import { ErrorBoundary } from './components/ErrorBoundary';

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Home />} />
              <Route path="judging" element={<JudgingPortal />} />
              <Route path="results" element={<ResultsPage />} />
              <Route path="admin/normalization" element={<NormalizationStudio />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;

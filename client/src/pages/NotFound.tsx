import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotFoundState } from '../components/ui/FeedbackStates';

export const NotFound: FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '640px', margin: '40px auto' }}>
      <NotFoundState onAction={() => navigate('/')} />
    </div>
  );
};

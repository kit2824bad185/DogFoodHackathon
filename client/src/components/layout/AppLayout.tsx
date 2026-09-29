import type { FC } from 'react';
import { PublicLayout } from '../../layouts/PublicLayout';

/**
 * AppLayout legacy wrapper pointing directly to the new PublicLayout.
 * Preserves backward compatibility with existing imports.
 */
export const AppLayout: FC = () => {
  return <PublicLayout />;
};

export default AppLayout;

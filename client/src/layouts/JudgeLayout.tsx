import type { FC } from 'react';
import { SidebarLayout, type NavSection } from './SidebarLayout';
import { Badge, Icon } from '../components/ui';

export const JudgeLayout: FC = () => {
  const navSections: NavSection[] = [
    {
      title: 'Evaluation Queue',
      items: [
        { label: 'Dashboard', to: '/judge', icon: 'award', exact: true },
        { label: 'Assigned Projects', to: '/judge/assignments', icon: 'file-text' },
        { label: 'Conflicts / COI', to: '/judge/conflicts', icon: 'flag' },
        { label: 'History & Finalized', to: '/judge/history', icon: 'clock' },
      ],
    },
  ];

  const privacyBanner = (
    <div
      style={{
        backgroundColor: 'var(--bg-subtle)',
        borderBottom: '1px solid var(--border-default)',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: 'var(--text-xs)',
        color: 'var(--text-secondary)',
      }}
    >
      <div style={{ color: 'var(--color-primary-600)', display: 'flex', alignItems: 'center' }}>
        <Icon name="shield" size={16} />
      </div>
      <div>
        <strong style={{ color: 'var(--text-primary)' }}>Blind Evaluation Integrity Mode:</strong>{' '}
        Scores and rubric submissions are strictly isolated to your judge identity. Peer assignments, scores, and feedback remain concealed to protect judging fairness.
      </div>
    </div>
  );

  return (
    <SidebarLayout
      portalName="Judge Portal"
      portalBadge={<Badge variant="info" size="sm">Judge Mode</Badge>}
      portalHomeUrl="/judge"
      navSections={navSections}
      banner={privacyBanner}
    />
  );
};

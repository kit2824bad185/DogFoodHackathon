import type { FC } from 'react';
import { SidebarLayout, type NavSection } from './SidebarLayout';
import { Badge } from '../components/ui';

export const ParticipantLayout: FC = () => {
  const navSections: NavSection[] = [
    {
      title: 'Hackathon Journey',
      items: [
        { label: 'Dashboard', to: '/participant', icon: 'award', exact: true },
        { label: 'My Registration', to: '/participant/registration', icon: 'user' },
        { label: 'My Team', to: '/participant/team', icon: 'users' },
        { label: 'My Project', to: '/participant/project', icon: 'file' },
        { label: 'Submission', to: '/participant/submission', icon: 'file-text' },
        { label: 'Eligibility', to: '/participant/eligibility', icon: 'shield' },
      ],
    },
    {
      title: 'Updates & Outcomes',
      items: [
        { label: 'Announcements', to: '/participant/announcements', icon: 'info' },
        { label: 'Results', to: '/participant/results', icon: 'award' },
        { label: 'Certificate', to: '/participant/certificate', icon: 'file' },
      ],
    },
  ];

  return (
    <SidebarLayout
      portalName="Participant Portal"
      portalBadge={<Badge variant="primary" size="sm">Participant</Badge>}
      portalHomeUrl="/participant"
      navSections={navSections}
    />
  );
};

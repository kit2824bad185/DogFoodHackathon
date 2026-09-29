import type { FC } from 'react';
import { SidebarLayout, type NavSection } from './SidebarLayout';
import { Badge } from '../components/ui';

export const OrganizerLayout: FC = () => {
  const navSections: NavSection[] = [
    {
      title: 'Event Management',
      collapsible: true,
      items: [
        { label: 'Command Center', to: '/organizer', icon: 'shield', exact: true },
        { label: 'Event Configuration', to: '/organizer/event', icon: 'calendar' },
        { label: 'Participants', to: '/organizer/participants', icon: 'user' },
        { label: 'Teams', to: '/organizer/teams', icon: 'users' },
        { label: 'Projects', to: '/organizer/projects', icon: 'file' },
        { label: 'Submissions', to: '/organizer/submissions', icon: 'file-text' },
        { label: 'Eligibility', to: '/organizer/eligibility', icon: 'check-circle' },
      ],
    },
    {
      title: 'Judging & Evaluation',
      collapsible: true,
      items: [
        { label: 'Rubrics & Criteria', to: '/organizer/rubrics', icon: 'file-text' },
        { label: 'Judges', to: '/organizer/judges', icon: 'users' },
        { label: 'Assignments', to: '/organizer/assignments', icon: 'edit' },
        { label: 'COI Review', to: '/organizer/coi', icon: 'flag' },
        { label: 'Scores Stream', to: '/organizer/scores', icon: 'check-circle' },
        { label: 'Normalization', to: '/organizer/normalization', icon: 'refresh' },
      ],
    },
    {
      title: 'Results & Outcomes',
      collapsible: true,
      items: [
        { label: 'Rankings & Results', to: '/organizer/results', icon: 'award' },
        { label: 'Awards', to: '/organizer/awards', icon: 'award' },
        { label: 'Certificates', to: '/organizer/certificates', icon: 'file' },
      ],
    },
    {
      title: 'Platform System',
      collapsible: true,
      items: [
        { label: 'Announcements', to: '/organizer/announcements', icon: 'info' },
        { label: 'Audit Trail', to: '/organizer/audit-log', icon: 'clock' },
        { label: 'Archive', to: '/organizer/archive', icon: 'download' },
        { label: 'Settings', to: '/organizer/settings', icon: 'settings' },
      ],
    },
  ];

  return (
    <SidebarLayout
      portalName="Organizer Center"
      portalBadge={<Badge variant="danger" size="sm">Admin</Badge>}
      portalHomeUrl="/organizer"
      navSections={navSections}
    />
  );
};

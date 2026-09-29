import type { FC, HTMLAttributes } from 'react';

export type HackathonStatus =
  | 'Draft'
  | 'Pending'
  | 'In Progress'
  | 'Submitted'
  | 'Eligible'
  | 'Not Eligible'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'Locked'
  | 'Published'
  | 'Conflict'
  | 'Error';

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: HackathonStatus | string;
  showDot?: boolean;
}

interface StatusConfig {
  label: string;
  bgVar: string;
  textVar: string;
  borderVar: string;
  dotColor: string;
}

const statusConfigs: Record<string, StatusConfig> = {
  draft: {
    label: 'Draft',
    bgVar: 'var(--status-draft-bg)',
    textVar: 'var(--status-draft-text)',
    borderVar: 'var(--status-draft-border)',
    dotColor: '#64748b',
  },
  pending: {
    label: 'Pending',
    bgVar: 'var(--status-pending-bg)',
    textVar: 'var(--status-pending-text)',
    borderVar: 'var(--status-pending-border)',
    dotColor: '#d97706',
  },
  'in progress': {
    label: 'In Progress',
    bgVar: 'var(--status-progress-bg)',
    textVar: 'var(--status-progress-text)',
    borderVar: 'var(--status-progress-border)',
    dotColor: '#2563eb',
  },
  inprogress: {
    label: 'In Progress',
    bgVar: 'var(--status-progress-bg)',
    textVar: 'var(--status-progress-text)',
    borderVar: 'var(--status-progress-border)',
    dotColor: '#2563eb',
  },
  submitted: {
    label: 'Submitted',
    bgVar: 'var(--status-submitted-bg)',
    textVar: 'var(--status-submitted-text)',
    borderVar: 'var(--status-submitted-border)',
    dotColor: '#16a34a',
  },
  eligible: {
    label: 'Eligible',
    bgVar: 'var(--status-eligible-bg)',
    textVar: 'var(--status-eligible-text)',
    borderVar: 'var(--status-eligible-border)',
    dotColor: '#059669',
  },
  'not eligible': {
    label: 'Not Eligible',
    bgVar: 'var(--status-ineligible-bg)',
    textVar: 'var(--status-ineligible-text)',
    borderVar: 'var(--status-ineligible-border)',
    dotColor: '#dc2626',
  },
  noteligible: {
    label: 'Not Eligible',
    bgVar: 'var(--status-ineligible-bg)',
    textVar: 'var(--status-ineligible-text)',
    borderVar: 'var(--status-ineligible-border)',
    dotColor: '#dc2626',
  },
  approved: {
    label: 'Approved',
    bgVar: 'var(--status-approved-bg)',
    textVar: 'var(--status-approved-text)',
    borderVar: 'var(--status-approved-border)',
    dotColor: '#059669',
  },
  rejected: {
    label: 'Rejected',
    bgVar: 'var(--status-rejected-bg)',
    textVar: 'var(--status-rejected-text)',
    borderVar: 'var(--status-rejected-border)',
    dotColor: '#dc2626',
  },
  completed: {
    label: 'Completed',
    bgVar: 'var(--status-completed-bg)',
    textVar: 'var(--status-completed-text)',
    borderVar: 'var(--status-completed-border)',
    dotColor: '#0d9488',
  },
  locked: {
    label: 'Locked',
    bgVar: 'var(--status-locked-bg)',
    textVar: 'var(--status-locked-text)',
    borderVar: 'var(--status-locked-border)',
    dotColor: '#4b5563',
  },
  published: {
    label: 'Published',
    bgVar: 'var(--status-published-bg)',
    textVar: 'var(--status-published-text)',
    borderVar: 'var(--status-published-border)',
    dotColor: '#7c3aed',
  },
  conflict: {
    label: 'Conflict',
    bgVar: 'var(--status-conflict-bg)',
    textVar: 'var(--status-conflict-text)',
    borderVar: 'var(--status-conflict-border)',
    dotColor: '#e11d48',
  },
  error: {
    label: 'Error',
    bgVar: 'var(--status-error-bg)',
    textVar: 'var(--status-error-text)',
    borderVar: 'var(--status-error-border)',
    dotColor: '#dc2626',
  },
};

export const StatusBadge: FC<StatusBadgeProps> = ({
  status,
  showDot = true,
  className = '',
  style,
  ...props
}) => {
  const normalizedKey = status.toLowerCase().trim();
  const config = statusConfigs[normalizedKey] || {
    label: status,
    bgVar: 'var(--bg-subtle)',
    textVar: 'var(--text-secondary)',
    borderVar: 'var(--border-default)',
    dotColor: 'var(--text-muted)',
  };

  return (
    <span
      className={`ui-status-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        fontSize: 'var(--text-xs)',
        fontWeight: 600,
        borderRadius: 'var(--radius-full)',
        backgroundColor: config.bgVar,
        color: config.textVar,
        border: `1px solid ${config.borderVar}`,
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...style,
      }}
      {...props}
    >
      {showDot && (
        <span
          aria-hidden="true"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: config.dotColor,
            flexShrink: 0,
          }}
        />
      )}
      <span>{config.label}</span>
    </span>
  );
};

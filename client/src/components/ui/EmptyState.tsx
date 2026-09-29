import type { FC, ReactNode } from 'react';
import type { IconName } from './Icon';
import { Icon } from './Icon';

export interface EmptyStateProps {
  icon?: IconName | ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon = 'file-text',
  title,
  description,
  action,
  className = '',
}) => {
  const renderIcon = () => {
    if (typeof icon === 'string') {
      return <Icon name={icon as IconName} size={36} />;
    }
    return icon;
  };

  return (
    <div
      className={`ui-empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-10) var(--space-6)',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px dashed var(--border-default)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
        }}
      >
        {renderIcon()}
      </div>

      <h3
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-1)',
        }}
      >
        {title}
      </h3>

      {description && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            maxWidth: '440px',
            marginBottom: action ? 'var(--space-6)' : 0,
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
};

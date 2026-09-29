import type { FC, ReactNode } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  code?: string | number;
  onRetry?: () => void;
  retryText?: string;
  action?: ReactNode;
  className?: string;
}

export const ErrorState: FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this data. Please try again.',
  code,
  onRetry,
  retryText = 'Try Again',
  action,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`ui-error-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-10) var(--space-6)',
        backgroundColor: 'var(--status-ineligible-bg)',
        border: '1px solid var(--status-ineligible-border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--status-ineligible-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Icon name="alert-triangle" size={28} />
      </div>

      <h3
        style={{
          fontSize: 'var(--text-lg)',
          fontWeight: 600,
          color: 'var(--status-ineligible-text)',
          marginBottom: 'var(--space-1)',
        }}
      >
        {title}
      </h3>

      {code && (
        <code
          style={{
            fontSize: 'var(--text-xs)',
            backgroundColor: 'var(--bg-surface)',
            color: 'var(--status-ineligible-text)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--status-ineligible-border)',
            marginBottom: 'var(--space-2)',
          }}
        >
          Code: {code}
        </code>
      )}

      {message && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            maxWidth: '460px',
            marginBottom: onRetry || action ? 'var(--space-6)' : 0,
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {message}
        </p>
      )}

      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        {onRetry && (
          <Button variant="outline" leftIcon="refresh" onClick={onRetry}>
            {retryText}
          </Button>
        )}
        {action}
      </div>
    </div>
  );
};

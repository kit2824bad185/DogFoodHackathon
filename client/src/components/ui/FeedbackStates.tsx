import type { FC, ReactNode } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

export interface FeedbackStateProps {
  title?: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  customAction?: ReactNode;
  className?: string;
}

export const NotFoundState: FC<FeedbackStateProps> = ({
  title = 'Page Not Found',
  message = "Sorry, the page you are looking for doesn't exist or has been moved.",
  actionText = 'Go Back Home',
  onAction,
  customAction,
  className = '',
}) => {
  return (
    <div
      className={`ui-not-found-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-12) var(--space-6)',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-subtle)',
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
        }}
      >
        <span style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-muted)' }}>404</span>
      </div>

      <h2
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-muted)',
          maxWidth: '440px',
          marginBottom: 'var(--space-6)',
          lineHeight: 'var(--leading-normal)',
        }}
      >
        {message}
      </p>

      {customAction ? (
        customAction
      ) : onAction ? (
        <Button variant="primary" leftIcon="arrow-left" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </div>
  );
};

export const UnauthorizedState: FC<FeedbackStateProps> = ({
  title = 'Authentication Required',
  message = 'You must be signed in with an authorized account to access this section.',
  actionText = 'Sign In',
  onAction,
  customAction,
  className = '',
}) => {
  return (
    <div
      className={`ui-unauthorized-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-12) var(--space-6)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-primary-50)',
          color: 'var(--color-primary-600)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
        }}
      >
        <Icon name="lock" size={32} />
      </div>

      <h2
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-muted)',
          maxWidth: '440px',
          marginBottom: 'var(--space-6)',
          lineHeight: 'var(--leading-normal)',
        }}
      >
        {message}
      </p>

      {customAction ? (
        customAction
      ) : onAction ? (
        <Button variant="primary" leftIcon="user" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </div>
  );
};

export const ForbiddenState: FC<FeedbackStateProps> = ({
  title = 'Access Denied',
  message = 'You do not have the required permissions to view this resource. Please contact the hackathon organizers.',
  actionText = 'Return to Dashboard',
  onAction,
  customAction,
  className = '',
}) => {
  return (
    <div
      className={`ui-forbidden-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-12) var(--space-6)',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--status-ineligible-bg)',
          color: 'var(--status-ineligible-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
        }}
      >
        <Icon name="shield" size={32} />
      </div>

      <h2
        style={{
          fontSize: 'var(--text-2xl)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-2)',
        }}
      >
        {title}
      </h2>

      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-muted)',
          maxWidth: '460px',
          marginBottom: 'var(--space-6)',
          lineHeight: 'var(--leading-normal)',
        }}
      >
        {message}
      </p>

      {customAction ? (
        customAction
      ) : onAction ? (
        <Button variant="secondary" onClick={onAction}>
          {actionText}
        </Button>
      ) : null}
    </div>
  );
};

export const SuccessFeedback: FC<{
  title: string;
  message?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}> = ({
  title,
  message,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`ui-success-feedback ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-10) var(--space-6)',
        backgroundColor: 'var(--status-eligible-bg)',
        border: '1px solid var(--status-eligible-border)',
        borderRadius: 'var(--radius-lg)',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--bg-surface)',
          color: 'var(--status-eligible-text)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-4)',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <Icon name="check-circle" size={32} />
      </div>

      <h3
        style={{
          fontSize: 'var(--text-xl)',
          fontWeight: 600,
          color: 'var(--status-eligible-text)',
          marginBottom: 'var(--space-1)',
        }}
      >
        {title}
      </h3>

      {message && (
        <p
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            maxWidth: '440px',
            marginBottom: onAction ? 'var(--space-6)' : 0,
            lineHeight: 'var(--leading-normal)',
          }}
        >
          {message}
        </p>
      )}

      {onAction && actionText && (
        <Button variant="success" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

import type { FC, HTMLAttributes, ReactNode } from 'react';

export type BadgeVariant =
  | 'neutral'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'outline';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}

export const Badge: FC<BadgeProps> = ({
  variant = 'neutral',
  size = 'md',
  children,
  className = '',
  style,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, { background: string; color: string; border: string }> = {
    neutral: {
      background: 'var(--bg-subtle)',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-default)',
    },
    primary: {
      background: 'var(--color-primary-50)',
      color: 'var(--color-primary-600)',
      border: '1px solid var(--color-primary-100)',
    },
    success: {
      background: 'var(--status-eligible-bg)',
      color: 'var(--status-eligible-text)',
      border: '1px solid var(--status-eligible-border)',
    },
    warning: {
      background: 'var(--status-pending-bg)',
      color: 'var(--status-pending-text)',
      border: '1px solid var(--status-pending-border)',
    },
    danger: {
      background: 'var(--status-ineligible-bg)',
      color: 'var(--status-ineligible-text)',
      border: '1px solid var(--status-ineligible-border)',
    },
    info: {
      background: 'var(--status-progress-bg)',
      color: 'var(--status-progress-text)',
      border: '1px solid var(--status-progress-border)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid var(--border-strong)',
    },
  };

  const sizeStyles: Record<BadgeSize, { padding: string; fontSize: string }> = {
    sm: { padding: '2px 8px', fontSize: 'var(--text-xs)' },
    md: { padding: '4px 10px', fontSize: 'var(--text-sm)' },
  };

  return (
    <span
      className={`ui-badge ui-badge-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 500,
        borderRadius: 'var(--radius-full)',
        lineHeight: 1.2,
        whiteSpace: 'nowrap',
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style,
      }}
      {...props}
    >
      {children}
    </span>
  );
};

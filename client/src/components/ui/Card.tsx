import type { FC, HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const Card: FC<CardProps> = ({
  hoverable = false,
  padding = 'md',
  children,
  className = '',
  style,
  ...props
}) => {
  const paddingMap: Record<string, string> = {
    none: '0',
    sm: 'var(--space-3)',
    md: 'var(--space-5)',
    lg: 'var(--space-8)',
  };

  return (
    <div
      className={`ui-card ${className}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding: paddingMap[padding],
        transition: hoverable ? 'border-color var(--transition-fast), box-shadow var(--transition-fast)' : undefined,
        cursor: hoverable ? 'pointer' : 'default',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  actions?: ReactNode;
  children?: ReactNode;
}

export const CardHeader: FC<CardHeaderProps> = ({
  actions,
  children,
  className = '',
  style,
  ...props
}) => (
  <div
    className={`ui-card-header ${className}`}
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 'var(--space-4)',
      marginBottom: 'var(--space-4)',
      ...style,
    }}
    {...props}
  >
    <div style={{ flex: 1 }}>{children}</div>
    {actions && <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>{actions}</div>}
  </div>
);

export const CardTitle: FC<HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  style,
  ...props
}) => (
  <h3
    className={`ui-card-title ${className}`}
    style={{
      fontSize: 'var(--text-lg)',
      fontWeight: 600,
      color: 'var(--text-primary)',
      margin: 0,
      ...style,
    }}
    {...props}
  >
    {children}
  </h3>
);

export const CardDescription: FC<HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  style,
  ...props
}) => (
  <p
    className={`ui-card-description ${className}`}
    style={{
      fontSize: 'var(--text-sm)',
      color: 'var(--text-muted)',
      marginTop: 'var(--space-1)',
      margin: 0,
      ...style,
    }}
    {...props}
  >
    {children}
  </p>
);

export const CardContent: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  style,
  ...props
}) => (
  <div
    className={`ui-card-content ${className}`}
    style={{
      color: 'var(--text-secondary)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

export const CardFooter: FC<HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  style,
  ...props
}) => (
  <div
    className={`ui-card-footer ${className}`}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 'var(--space-2)',
      marginTop: 'var(--space-5)',
      paddingTop: 'var(--space-4)',
      borderTop: '1px solid var(--border-subtle)',
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
);

import type { FC, ReactNode } from 'react';
import { Icon } from './Icon';

export interface BreadcrumbItem {
  label: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`ui-breadcrumb ${className}`}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '6px',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: 'var(--text-xs)',
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={index}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {isLast ? (
                <span
                  aria-current="page"
                  style={{
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                  }}
                >
                  {item.label}
                </span>
              ) : item.href ? (
                <a
                  href={item.href}
                  style={{
                    color: 'var(--text-muted)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary-600)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {item.label}
                </a>
              ) : item.onClick ? (
                <button
                  type="button"
                  onClick={item.onClick}
                  style={{
                    color: 'var(--text-muted)',
                    padding: 0,
                    fontSize: 'inherit',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary-600)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  {item.label}
                </button>
              ) : (
                <span style={{ color: 'var(--text-muted)' }}>{item.label}</span>
              )}

              {!isLast && (
                <span
                  aria-hidden="true"
                  style={{
                    color: 'var(--text-subtle)',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  <Icon name="chevron-right" size={12} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

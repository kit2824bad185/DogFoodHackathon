import type { FC } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  className = '',
}) => {
  const getVisiblePages = () => {
    const delta = 1;
    const range: (number | 'ellipsis')[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      } else if (range[range.length - 1] !== 'ellipsis') {
        range.push('ellipsis');
      }
    }

    return range;
  };

  const startItem = totalItems && pageSize ? (currentPage - 1) * pageSize + 1 : null;
  const endItem =
    totalItems && pageSize ? Math.min(currentPage * pageSize, totalItems) : null;

  return (
    <nav
      aria-label="Pagination Navigation"
      className={`ui-pagination ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
        padding: 'var(--space-3) 0',
      }}
    >
      {/* Item summary */}
      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
        {totalItems !== undefined && startItem && endItem ? (
          <span>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{startItem}</strong> to{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{endItem}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong style={{ color: 'var(--text-primary)' }}>{currentPage}</strong> of{' '}
            <strong style={{ color: 'var(--text-primary)' }}>{Math.max(1, totalPages)}</strong>
          </span>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {pageSize && onPageSizeChange && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginRight: 'var(--space-3)',
            }}
          >
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Items per page"
              style={{
                height: '32px',
                padding: '0 8px',
                fontSize: 'var(--text-xs)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)',
              }}
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous Page"
        >
          <Icon name="chevron-left" size={14} />
        </Button>

        {getVisiblePages().map((p, idx) => {
          if (p === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${idx}`}
                style={{
                  padding: '0 6px',
                  color: 'var(--text-muted)',
                  fontSize: 'var(--text-sm)',
                }}
              >
                …
              </span>
            );
          }

          const isCurrent = p === currentPage;

          return (
            <button
              key={p}
              type="button"
              aria-current={isCurrent ? 'page' : undefined}
              onClick={() => onPageChange(p)}
              style={{
                minWidth: '32px',
                height: '32px',
                padding: '0 8px',
                fontSize: 'var(--text-xs)',
                fontWeight: isCurrent ? 600 : 500,
                borderRadius: 'var(--radius-md)',
                backgroundColor: isCurrent ? 'var(--color-primary-600)' : 'transparent',
                color: isCurrent ? '#ffffff' : 'var(--text-primary)',
                border: isCurrent
                  ? '1px solid var(--color-primary-600)'
                  : '1px solid var(--border-default)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {p}
            </button>
          );
        })}

        <Button
          size="sm"
          variant="outline"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next Page"
        >
          <Icon name="chevron-right" size={14} />
        </Button>
      </div>
    </nav>
  );
};

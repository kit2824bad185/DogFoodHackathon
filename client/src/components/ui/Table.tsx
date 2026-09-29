import type { ReactNode } from 'react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { ErrorState } from './ErrorState';
import { Icon } from './Icon';

export interface Column<T> {
  header: ReactNode;
  id?: string;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sortable?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  isLoading?: boolean;
  loadingRowCount?: number;
  error?: string | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (columnId: string) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  loadingRowCount = 5,
  error = null,
  onRetry,
  emptyTitle = 'No records found',
  emptyDescription = 'There are no items to display right now.',
  emptyAction,
  onRowClick,
  sortColumn,
  sortDirection,
  onSort,
  className = '',
}: TableProps<T>) {
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  const renderSortIcon = (columnId?: string) => {
    if (!columnId || columnId !== sortColumn) {
      return <Icon name="sort" size={14} style={{ opacity: 0.4 }} />;
    }
    return sortDirection === 'asc' ? (
      <Icon name="sort-asc" size={14} style={{ color: 'var(--color-primary-600)' }} />
    ) : (
      <Icon name="sort-desc" size={14} style={{ color: 'var(--color-primary-600)' }} />
    );
  };

  return (
    <div
      className={`ui-table-container ${className}`}
      style={{
        width: '100%',
        overflowX: 'auto',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          textAlign: 'left',
          fontSize: 'var(--text-sm)',
        }}
      >
        <thead>
          <tr
            style={{
              backgroundColor: 'var(--bg-subtle)',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            {columns.map((col, idx) => {
              const colId = col.id || String(col.accessorKey || idx);
              const isSortable = Boolean(col.sortable && onSort);

              return (
                <th
                  key={colId}
                  scope="col"
                  style={{
                    padding: '12px 16px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    textAlign: col.align || 'left',
                    width: col.width,
                    whiteSpace: 'nowrap',
                    userSelect: isSortable ? 'none' : 'auto',
                    cursor: isSortable ? 'pointer' : 'default',
                  }}
                  onClick={() => {
                    if (isSortable && onSort) {
                      onSort(colId);
                    }
                  }}
                >
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      justifyContent:
                        col.align === 'center'
                          ? 'center'
                          : col.align === 'right'
                          ? 'flex-end'
                          : 'flex-start',
                      width: '100%',
                    }}
                  >
                    <span>{col.header}</span>
                    {isSortable && renderSortIcon(colId)}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {isLoading ? (
            Array.from({ length: loadingRowCount }).map((_, rowIndex) => (
              <tr
                key={`loading-${rowIndex}`}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                {columns.map((_, colIndex) => (
                  <td key={`loading-cell-${colIndex}`} style={{ padding: '14px 16px' }}>
                    <Skeleton variant="text" width={colIndex === 0 ? '60%' : '80%'} />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: 'var(--space-8)' }}>
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                />
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const rowKey = keyExtractor(row, rowIndex);
              const isClickable = Boolean(onRowClick);

              return (
                <tr
                  key={rowKey}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    backgroundColor: 'transparent',
                    cursor: isClickable ? 'pointer' : 'default',
                    transition: 'background-color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isClickable) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {columns.map((col, colIndex) => {
                    const colId = col.id || String(col.accessorKey || colIndex);
                    let cellContent: ReactNode = null;

                    if (col.cell) {
                      cellContent = col.cell(row, rowIndex);
                    } else if (col.accessorKey) {
                      const value = row[col.accessorKey];
                      cellContent = value !== undefined && value !== null ? String(value) : '-';
                    }

                    return (
                      <td
                        key={colId}
                        style={{
                          padding: '12px 16px',
                          color: 'var(--text-primary)',
                          textAlign: col.align || 'left',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'normal',
                          verticalAlign: 'middle',
                        }}
                      >
                        {cellContent}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

import type { FC, HTMLAttributes } from 'react';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular';

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton: FC<SkeletonProps> = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  style,
  ...props
}) => {
  const getBorderRadius = () => {
    switch (variant) {
      case 'circular':
        return 'var(--radius-full)';
      case 'text':
        return 'var(--radius-sm)';
      case 'rectangular':
        return 'var(--radius-md)';
    }
  };

  const getDefaultHeight = () => {
    switch (variant) {
      case 'text':
        return '14px';
      case 'circular':
        return width || '40px';
      case 'rectangular':
        return '120px';
    }
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <>
      {items.map((i) => (
        <div
          key={i}
          aria-hidden="true"
          className={`ui-skeleton ${className}`}
          style={{
            width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
            height: height ? (typeof height === 'number' ? `${height}px` : height) : getDefaultHeight(),
            borderRadius: getBorderRadius(),
            backgroundColor: 'var(--bg-subtle)',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: count > 1 && i < count - 1 ? 'var(--space-2)' : undefined,
            ...style,
          }}
          {...props}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </>
  );
};

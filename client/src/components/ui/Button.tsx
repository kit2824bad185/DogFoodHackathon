import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import type { IconName } from './Icon';
import { Icon } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: IconName | ReactNode;
  rightIcon?: IconName | ReactNode;
  fullWidth?: boolean;
  children?: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled = false,
      children,
      className = '',
      style,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    // Base padding and height by size
    const sizeStyles: Record<ButtonSize, { height: string; padding: string; fontSize: string; gap: string }> = {
      sm: { height: '32px', padding: '0 12px', fontSize: 'var(--text-xs)', gap: '6px' },
      md: { height: '40px', padding: '0 16px', fontSize: 'var(--text-sm)', gap: '8px' },
      lg: { height: '48px', padding: '0 24px', fontSize: 'var(--text-base)', gap: '10px' },
    };

    // Variant styles
    const getVariantStyles = (): { background: string; color: string; border: string } => {
      switch (variant) {
        case 'primary':
          return {
            background: 'var(--color-primary-600)',
            color: '#ffffff',
            border: '1px solid transparent',
          };
        case 'secondary':
          return {
            background: 'var(--bg-subtle)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-default)',
          };
        case 'outline':
          return {
            background: 'transparent',
            color: 'var(--color-primary-600)',
            border: '1px solid var(--border-default)',
          };
        case 'ghost':
          return {
            background: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid transparent',
          };
        case 'danger':
          return {
            background: 'var(--status-rejected-border)',
            color: '#ffffff',
            border: '1px solid transparent',
          };
        case 'success':
          return {
            background: 'var(--status-eligible-text)',
            color: '#ffffff',
            border: '1px solid transparent',
          };
      }
    };

    const currentSize = sizeStyles[size];
    const currentVariant = getVariantStyles();

    const renderIcon = (icon: IconName | ReactNode) => {
      if (typeof icon === 'string') {
        return <Icon name={icon as IconName} size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />;
      }
      return icon;
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading}
        className={`ui-button ui-button-${variant} ui-button-${size} ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 500,
          borderRadius: 'var(--radius-md)',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          opacity: isDisabled ? 0.65 : 1,
          width: fullWidth ? '100%' : 'auto',
          boxShadow: variant === 'primary' ? 'var(--shadow-xs)' : 'none',
          transition: 'all var(--transition-fast)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          textDecoration: 'none',
          ...currentSize,
          ...currentVariant,
          ...style,
        }}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size={size === 'lg' ? 'md' : 'sm'} color="currentColor" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span style={{ display: 'inline-flex' }}>{renderIcon(leftIcon)}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span style={{ display: 'inline-flex' }}>{renderIcon(rightIcon)}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

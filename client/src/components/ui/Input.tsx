import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';
import type { IconName } from './Icon';
import { Icon } from './Icon';
import { LoadingSpinner } from './LoadingSpinner';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  success?: string;
  leftIcon?: IconName | ReactNode;
  rightIcon?: IconName | ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      success,
      leftIcon,
      rightIcon,
      isLoading = false,
      fullWidth = true,
      disabled,
      required,
      id: customId,
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = customId || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const hasError = Boolean(error);
    const hasSuccess = Boolean(success) && !hasError;

    const renderIcon = (icon: IconName | ReactNode) => {
      if (typeof icon === 'string') {
        return <Icon name={icon as IconName} size={16} />;
      }
      return icon;
    };

    return (
      <div
        className={`ui-input-group ${className}`}
        style={{
          display: fullWidth ? 'flex' : 'inline-flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          width: fullWidth ? '100%' : 'auto',
          ...style,
        }}
      >
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 500,
              color: hasError ? 'var(--status-rejected-text)' : 'var(--text-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
            }}
          >
            {label}
            {required && (
              <span aria-hidden="true" style={{ color: 'var(--status-rejected-text)' }}>
                *
              </span>
            )}
          </label>
        )}

        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
          }}
        >
          {leftIcon && (
            <div
              style={{
                position: 'absolute',
                left: '12px',
                display: 'flex',
                alignItems: 'center',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            >
              {renderIcon(leftIcon)}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled || isLoading}
            required={required}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            style={{
              width: '100%',
              height: '40px',
              padding: leftIcon
                ? rightIcon || isLoading || hasSuccess
                  ? '0 36px 0 36px'
                  : '0 12px 0 36px'
                : rightIcon || isLoading || hasSuccess
                ? '0 36px 0 12px'
                : '0 12px',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              backgroundColor: disabled ? 'var(--bg-subtle)' : 'var(--bg-surface)',
              border: `1px solid ${
                hasError
                  ? 'var(--status-rejected-border)'
                  : hasSuccess
                  ? 'var(--status-eligible-border)'
                  : 'var(--border-default)'
              }`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xs)',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
              outline: 'none',
            }}
            {...props}
          />

          {(rightIcon || isLoading || hasSuccess || hasError) && (
            <div
              style={{
                position: 'absolute',
                right: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                color: hasError
                  ? 'var(--status-rejected-text)'
                  : hasSuccess
                  ? 'var(--status-eligible-text)'
                  : 'var(--text-muted)',
              }}
            >
              {isLoading ? (
                <LoadingSpinner size="xs" color="currentColor" />
              ) : hasSuccess ? (
                <Icon name="check-circle" size={16} />
              ) : hasError ? (
                <Icon name="alert-circle" size={16} />
              ) : (
                renderIcon(rightIcon)
              )}
            </div>
          )}
        </div>

        {hasError && (
          <p
            id={errorId}
            role="alert"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--status-rejected-text)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginTop: '2px',
            }}
          >
            {error}
          </p>
        )}

        {!hasError && hasSuccess && (
          <p
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--status-eligible-text)',
              marginTop: '2px',
            }}
          >
            {success}
          </p>
        )}

        {!hasError && !hasSuccess && helperText && (
          <p
            id={helperId}
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--text-muted)',
              marginTop: '2px',
            }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

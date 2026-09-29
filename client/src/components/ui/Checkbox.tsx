import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, disabled, id: customId, className = '', style, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = customId || generatedId;
    const errorId = `${checkboxId}-error`;

    return (
      <div
        className={`ui-checkbox-wrapper ${className}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          ...style,
        }}
      >
        <label
          htmlFor={checkboxId}
          style={{
            display: 'inline-flex',
            alignItems: 'flex-start',
            gap: 'var(--space-2)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            userSelect: 'none',
          }}
        >
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            style={{
              width: '16px',
              height: '16px',
              marginTop: '3px',
              accentColor: 'var(--color-primary-600)',
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
            {...props}
          />

          {(label || description) && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {label && (
                <span
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                  }}
                >
                  {label}
                </span>
              )}
              {description && (
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-muted)',
                    marginTop: '2px',
                  }}
                >
                  {description}
                </span>
              )}
            </div>
          )}
        </label>

        {error && (
          <p
            id={errorId}
            role="alert"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--status-rejected-text)',
              marginLeft: '24px',
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

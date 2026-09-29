import { forwardRef, useId, type SelectHTMLAttributes } from 'react';
import { Icon } from './Icon';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      options,
      placeholder,
      fullWidth = true,
      disabled,
      required,
      id: customId,
      className = '',
      style,
      value,
      defaultValue,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const selectId = customId || generatedId;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;

    const hasError = Boolean(error);

    return (
      <div
        className={`ui-select-group ${className}`}
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
            htmlFor={selectId}
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

        <div style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center' }}>
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            value={value}
            defaultValue={defaultValue}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 36px 0 12px',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              backgroundColor: disabled ? 'var(--bg-subtle)' : 'var(--bg-surface)',
              border: `1px solid ${hasError ? 'var(--status-rejected-border)' : 'var(--border-default)'}`,
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xs)',
              appearance: 'none',
              WebkitAppearance: 'none',
              outline: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>

          <div
            style={{
              position: 'absolute',
              right: '12px',
              pointerEvents: 'none',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Icon name="chevron-down" size={16} />
          </div>
        </div>

        {hasError && (
          <p
            id={errorId}
            role="alert"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--status-rejected-text)',
              marginTop: '2px',
            }}
          >
            {error}
          </p>
        )}

        {!hasError && helperText && (
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

Select.displayName = 'Select';

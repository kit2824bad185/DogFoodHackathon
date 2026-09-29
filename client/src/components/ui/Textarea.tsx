import { forwardRef, useId, type TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  showCount?: boolean;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      showCount = false,
      fullWidth = true,
      disabled,
      required,
      id: customId,
      maxLength,
      value,
      defaultValue,
      className = '',
      style,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = customId || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    const hasError = Boolean(error);
    const currentLength = typeof value === 'string' ? value.length : typeof defaultValue === 'string' ? defaultValue.length : 0;

    return (
      <div
        className={`ui-textarea-group ${className}`}
        style={{
          display: fullWidth ? 'flex' : 'inline-flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
          width: fullWidth ? '100%' : 'auto',
          ...style,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {label && (
            <label
              htmlFor={textareaId}
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

          {showCount && maxLength && (
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {currentLength}/{maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          required={required}
          value={value}
          defaultValue={defaultValue}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 'var(--text-sm)',
            fontFamily: 'inherit',
            lineHeight: 'var(--leading-normal)',
            color: 'var(--text-primary)',
            backgroundColor: disabled ? 'var(--bg-subtle)' : 'var(--bg-surface)',
            border: `1px solid ${hasError ? 'var(--status-rejected-border)' : 'var(--border-default)'}`,
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xs)',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
            outline: 'none',
            resize: 'vertical',
          }}
          {...props}
        />

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

Textarea.displayName = 'Textarea';

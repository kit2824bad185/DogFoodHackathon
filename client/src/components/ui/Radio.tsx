import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react';

export interface RadioOption {
  value: string;
  label: ReactNode;
  description?: string;
  disabled?: boolean;
}

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  description?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, disabled, id: customId, className = '', style, ...props }, ref) => {
    const generatedId = useId();
    const radioId = customId || generatedId;

    return (
      <label
        htmlFor={radioId}
        className={`ui-radio-wrapper ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'flex-start',
          gap: 'var(--space-2)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          userSelect: 'none',
          ...style,
        }}
      >
        <input
          ref={ref}
          type="radio"
          id={radioId}
          disabled={disabled}
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
    );
  }
);

Radio.displayName = 'Radio';

export interface RadioGroupProps {
  name: string;
  label?: string;
  options: RadioOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export const RadioGroup = ({
  name,
  label,
  options,
  value,
  defaultValue,
  onChange,
  error,
  disabled,
  className = '',
}: RadioGroupProps) => {
  return (
    <div
      role="radiogroup"
      aria-labelledby={label ? `${name}-group-label` : undefined}
      className={`ui-radio-group ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)',
      }}
    >
      {label && (
        <span
          id={`${name}-group-label`}
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 500,
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-1)',
          }}
        >
          {label}
        </span>
      )}

      {options.map((opt) => (
        <Radio
          key={opt.value}
          name={name}
          value={opt.value}
          label={opt.label}
          description={opt.description}
          disabled={disabled || opt.disabled}
          checked={value !== undefined ? value === opt.value : undefined}
          defaultChecked={defaultValue !== undefined ? defaultValue === opt.value : undefined}
          onChange={(e) => {
            if (e.target.checked && onChange) {
              onChange(opt.value);
            }
          }}
        />
      ))}

      {error && (
        <p
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
    </div>
  );
};

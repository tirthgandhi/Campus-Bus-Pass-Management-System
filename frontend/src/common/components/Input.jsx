import { useId, useState } from 'react';
import Icon from './Icon';

export default function Input({ label, error, helper, id, type = 'text', disabled, ...props }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const description = error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined;

  return (
    <div className={`auth-field${error ? ' auth-field-error' : ''}`}>
      <label htmlFor={inputId}>{label}</label>
      <div className={`auth-input-wrap${isPassword ? ' auth-password-wrap' : ''}`}>
        <input
          {...props}
          id={inputId}
          type={isPassword && showPassword ? 'text' : type}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={description || undefined}
        />
        {isPassword && (
          <button
            type="button"
            className="auth-password-toggle"
            aria-label={`${showPassword ? 'Hide' : 'Show'} ${label.toLowerCase()}`}
            aria-pressed={showPassword}
            aria-controls={inputId}
            onClick={() => setShowPassword((current) => !current)}
            disabled={disabled}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={19} />
          </button>
        )}
      </div>
      {helper && !error && <p className="auth-field-helper" id={`${inputId}-helper`}>{helper}</p>}
      {error && <p className="auth-field-message" id={`${inputId}-error`}>{error}</p>}
    </div>
  );
}

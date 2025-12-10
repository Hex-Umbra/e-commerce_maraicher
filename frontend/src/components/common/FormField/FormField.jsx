import React from 'react';
import PropTypes from 'prop-types';
import styles from './FormField.module.scss';

const FormField = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  rows = 5,
  className = '',
  helpText = '',
}) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const inputClassName = `${styles.input} ${error ? styles.inputError : ''} ${className}`;

  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.required} aria-label="requis"> *</span>}
      </label>
      
      {type === 'textarea' ? (
        <textarea
          id={id}
          className={inputClassName}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={rows}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      ) : (
        <input
          id={id}
          type={type}
          className={inputClassName}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
        />
      )}
      
      {error && (
        <span id={`${id}-error`} className={styles.fieldError} role="alert">
          {error}
        </span>
      )}
      
      {helpText && !error && (
        <span className={styles.helpText}>
          {helpText}
        </span>
      )}
    </div>
  );
};

FormField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  rows: PropTypes.number,
  className: PropTypes.string,
  helpText: PropTypes.string,
};

export default FormField;

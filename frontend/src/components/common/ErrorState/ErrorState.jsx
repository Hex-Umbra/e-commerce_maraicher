import PropTypes from 'prop-types';
import styles from './ErrorState.module.scss';

const ErrorState = ({ 
  message = "Une erreur est survenue", 
  onRetry = null,
  retryText = "Réessayer",
  className = "" 
}) => {
  return (
    <div className={`${styles.errorState} ${className}`} role="alert">
      <div className={styles.icon} aria-hidden="true">⚠️</div>
      <p className={styles.message}>{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className={styles.retryBtn}
          aria-label={retryText}
        >
          {retryText}
        </button>
      )}
    </div>
  );
};

ErrorState.propTypes = {
  message: PropTypes.string,
  onRetry: PropTypes.func,
  retryText: PropTypes.string,
  className: PropTypes.string,
};

export default ErrorState;

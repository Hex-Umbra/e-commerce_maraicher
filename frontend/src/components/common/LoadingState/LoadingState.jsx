import PropTypes from 'prop-types';
import styles from './LoadingState.module.scss';

const LoadingState = ({ 
  message = "Chargement...", 
  size = "medium",
  className = "" 
}) => {
  return (
    <div className={`${styles.loadingState} ${styles[size]} ${className}`}>
      <div className={styles.spinner} aria-hidden="true" />
      <p className={styles.message}>{message}</p>
    </div>
  );
};

LoadingState.propTypes = {
  message: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  className: PropTypes.string,
};

export default LoadingState;

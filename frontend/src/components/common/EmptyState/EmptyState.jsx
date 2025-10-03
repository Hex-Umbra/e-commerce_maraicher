import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import styles from './EmptyState.module.scss';

const EmptyState = ({ 
  message = "Aucun élément disponible", 
  icon = "📭",
  ctaText = null,
  ctaLink = null,
  onCtaClick = null,
  className = "" 
}) => {
  return (
    <div className={`${styles.emptyState} ${className}`}>
      {icon && <div className={styles.icon} aria-hidden="true">{icon}</div>}
      <p className={styles.message}>{message}</p>
      {ctaText && (
        ctaLink ? (
          <Link to={ctaLink} className={styles.cta}>
            {ctaText}
          </Link>
        ) : (
          <button onClick={onCtaClick} className={styles.cta}>
            {ctaText}
          </button>
        )
      )}
    </div>
  );
};

EmptyState.propTypes = {
  message: PropTypes.string,
  icon: PropTypes.string,
  ctaText: PropTypes.string,
  ctaLink: PropTypes.string,
  onCtaClick: PropTypes.func,
  className: PropTypes.string,
};

export default EmptyState;

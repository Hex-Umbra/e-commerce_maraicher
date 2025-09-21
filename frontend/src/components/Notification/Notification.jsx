import React from 'react';
import styles from './Notification.module.scss';

const Notification = ({ 
  message, 
  type = 'error', 
  onClose, 
  isVisible = true 
}) => {
  if (!isVisible) return null;

  return (
    <div className={`${styles.notification} ${styles[type]}`} role="alert">
      <div className={styles.content}>
        <span className={styles.message}>{message}</span>
        <button 
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Fermer la notification"
          type="button"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default Notification;

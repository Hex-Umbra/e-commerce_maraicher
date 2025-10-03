import React from 'react';
import PropTypes from 'prop-types';
import styles from './CommentCard.module.scss';

const CommentCard = ({ comment, username, rating, createdAt, avatar, index = 0 }) => {
  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return "";
    }
  };

  const getUserAvatar = (idx = 0) => {
    if (avatar) return avatar;
    const seed = idx + 1;
    return `https://i.pravatar.cc/100?img=${seed}`;
  };

  const displayUsername = username || "Nom Client";
  const displayAvatar = getUserAvatar(index);

  return (
    <div className={styles.commentRow}>
      <div className={styles.clientInfo}>
        <img 
          className={styles.clientAvatar} 
          src={displayAvatar} 
          alt={`Avatar de ${displayUsername}`}
          loading="lazy"
          onError={(e) => {
            const fallback = "https://i.pravatar.cc/100?img=1";
            if (!e.currentTarget.src.includes("i.pravatar.cc/100?img=1")) {
              e.currentTarget.src = fallback;
            }
          }}
        />
        <div className={styles.clientName}>{displayUsername}</div>
      </div>

      <div className={styles.vRule} aria-hidden="true" />

      <div className={styles.commentBody}>
        <div className={styles.commentText}>{comment}</div>
        <div className={styles.rating}>
          Rating : <strong>{rating}</strong>/5
        </div>
        {createdAt && (
          <div className={styles.date} aria-label="Date du commentaire">
            {formatDate(createdAt)}
          </div>
        )}
      </div>

      <div className={styles.rowDivider} aria-hidden="true" />
    </div>
  );
};

CommentCard.propTypes = {
  comment: PropTypes.string.isRequired,
  username: PropTypes.string,
  rating: PropTypes.number.isRequired,
  createdAt: PropTypes.string,
  avatar: PropTypes.string,
  index: PropTypes.number,
};

export default CommentCard;

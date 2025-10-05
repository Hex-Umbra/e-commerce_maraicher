import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from './CommentCard.module.scss';
import FormField from '../FormField';

const CommentCard = ({
  commentId,
  comment,
  username,
  rating,
  createdAt,
  avatar,
  index = 0,
  isOwner = false,
  onSave,
  onDelete,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [localComment, setLocalComment] = useState(comment);
  const [localRating, setLocalRating] = useState(rating);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!editMode) {
      setLocalComment(comment);
      setLocalRating(rating);
    }
  }, [comment, rating, editMode]);

  const formatDate = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString();
    } catch {
      return '';
    }
  };

  const getUserAvatar = (idx = 0) => {
    if (avatar) return avatar;
    const seed = idx + 1;
    return `https://i.pravatar.cc/100?img=${seed}`;
  };

  const displayUsername = username || 'Nom Client';
  const displayAvatar = getUserAvatar(index);

  const hasChanges =
    (localComment || '').trim() !== (comment || '') ||
    Number(localRating) !== Number(rating);

  const handleEdit = () => {
    setEditMode(true);
    setError('');
  };

  const handleCancel = () => {
    setEditMode(false);
    setLocalComment(comment);
    setLocalRating(rating);
    setError('');
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!onSave) {
      setEditMode(false);
      return;
    }
    const trimmed = (localComment || '').trim();
    if (trimmed.length < 5) {
      setError('Le commentaire doit contenir au moins 5 caractères');
      return;
    }
    if (localRating < 1 || localRating > 5) {
      setError('La note doit être comprise entre 1 et 5');
      return;
    }

    setSaving(true);
    try {
      const ok = await onSave(commentId, { comment: trimmed, rating: localRating });
      if (ok) {
        setEditMode(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    // eslint-disable-next-line no-alert
    const confirmed = window.confirm('Supprimer ce commentaire ?');
    if (!confirmed) return;
    await onDelete(commentId);
  };

  return (
    <div className={styles.commentRow}>
      <div className={styles.clientInfo}>
        <img
          className={styles.clientAvatar}
          src={displayAvatar}
          alt={`Avatar de ${displayUsername}`}
          loading="lazy"
          onError={(e) => {
            const fallback = 'https://i.pravatar.cc/100?img=1';
            if (!e.currentTarget.src.includes('i.pravatar.cc/100?img=1')) {
              e.currentTarget.src = fallback;
            }
          }}
        />
        <div className={styles.clientName}>{displayUsername}</div>
      </div>

      <div className={styles.vRule} aria-hidden="true" />

      <div className={styles.commentBody}>
        {editMode ? (
          <>
            <div className={styles.editForm}>
              <FormField
                id={`comment-edit-${commentId || index}`}
                label="Modifier le commentaire"
                type="textarea"
                value={localComment}
                onChange={setLocalComment}
                required
                error={error}
                rows={4}
              />
              <div>
                <label
                  htmlFor={`rating-edit-${commentId || index}`}
                  className={styles.commentLabel}
                >
                  Note
                </label>
                <select
                  id={`rating-edit-${commentId || index}`}
                  className={styles.ratingSelect}
                  value={localRating}
                  onChange={(e) => setLocalRating(Number(e.target.value))}
                  disabled={saving}
                  aria-label="Sélectionnez une note"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Très bien</option>
                  <option value={3}>3 - Bien</option>
                  <option value={2}>2 - Moyen</option>
                  <option value={1}>1 - Mauvais</option>
                </select>
              </div>
            </div>
            <div className={styles.ownerActions}>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.saveBtn}`}
                onClick={handleSave}
                disabled={saving || !hasChanges}
              >
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button
                type="button"
                className={`${styles.actionBtn} ${styles.cancelBtn}`}
                onClick={handleCancel}
                disabled={saving}
              >
                Annuler
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.commentText}>{comment}</div>
            <div className={styles.rating}>
              Rating : <strong>{rating}</strong>/5
            </div>
            {createdAt && (
              <div className={styles.date} aria-label="Date du commentaire">
                {formatDate(createdAt)}
              </div>
            )}
            {isOwner && (
              <div className={styles.ownerActions}>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.editBtn}`}
                  onClick={handleEdit}
                >
                  Modifier
                </button>
                <button
                  type="button"
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={handleDelete}
                >
                  Supprimer
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className={styles.rowDivider} aria-hidden="true" />
    </div>
  );
};

CommentCard.propTypes = {
  commentId: PropTypes.string,
  comment: PropTypes.string.isRequired,
  username: PropTypes.string,
  rating: PropTypes.number.isRequired,
  createdAt: PropTypes.string,
  avatar: PropTypes.string,
  index: PropTypes.number,
  isOwner: PropTypes.bool,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
};

export default CommentCard;

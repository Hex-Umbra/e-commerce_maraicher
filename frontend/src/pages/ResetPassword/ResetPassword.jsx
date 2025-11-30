import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import styles from './ResetPassword.module.scss';
import FormField from '../../components/common/FormField';
import { ROUTES } from '../../utils/routes';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { updateUser, showNotification } = useAuth();
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirm) {
      if (showNotification) {
        showNotification('Les mots de passe ne correspondent pas.', 'error');
      }
      return;
    }
    setLoading(true);

    try {
      const response = await userAPI.resetPassword(token, { password, passwordConfirm });
      if (showNotification) {
        showNotification('Mot de passe mis à jour avec succès !', 'success');
      }
      // The backend logs the user in, so we just update the auth context
      updateUser(response.user);
      navigate(ROUTES.profile); // Redirect to a protected route
    } catch (error) {
      if (showNotification) {
        showNotification(error.message || 'Une erreur est survenue.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.resetPassword}>
      <div className="container">
        <div className={styles.card}>
          <h2 className={styles.title}>Réinitialiser le mot de passe</h2>
          <p className={styles.subtitle}>
            Entrez votre nouveau mot de passe ci-dessous.
          </p>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <FormField
              label="Nouveau mot de passe"
              type="password"
              name="password"
              id="password"
              value={password}
              onChange={setPassword}
              required
            />
            <FormField
              label="Confirmer le mot de passe"
              type="password"
              name="passwordConfirm"
              id="passwordConfirm"
              value={passwordConfirm}
              onChange={setPasswordConfirm}
              required
            />
            <button type="submit" className={styles.submitButton} disabled={loading}>
              {loading ? 'Mise à jour...' : 'Changer le mot de passe'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

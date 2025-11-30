import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userAPI } from '../../services/api';
import styles from './ForgotPassword.module.scss';
import FormField from '../../components/common/FormField';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/routes';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { showNotification } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await userAPI.forgotPassword(email);
      setMessage(response.message);
      if (showNotification) {
        showNotification(response.message, 'success');
      }
    } catch (error) {
      if (showNotification) {
        showNotification(error.message || 'Une erreur est survenue.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.forgotPassword}>
      <div className="container">
        <div className={styles.card}>
          <h2 className={styles.title}>Mot de passe oublié</h2>
          <p className={styles.subtitle}>
            Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
          </p>
          
          {message ? (
            <div className={styles.message}>{message}</div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <FormField
                label="Adresse Email"
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
            </form>
          )}

          <div className={styles.backToLogin}>
            <Link to={ROUTES.login}>Retour à la connexion</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

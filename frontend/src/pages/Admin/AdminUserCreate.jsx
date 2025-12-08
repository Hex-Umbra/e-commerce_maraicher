import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import styles from './AdminUserEdit.module.scss'; // Reuse the same styles

const AdminUserCreate = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: '',
        email: '',
        password: '',
        passwordConfirm: '',
        address: '',
        role: 'client'
    });
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validate passwords match
        if (user.password !== user.passwordConfirm) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }

        // Validate password strength
        if (user.password.length < 8) {
            setError('Le mot de passe doit contenir au moins 8 caractères');
            return;
        }

        setSubmitting(true);
        try {
            // eslint-disable-next-line no-unused-vars
            const { passwordConfirm, ...userData } = user; // Remove passwordConfirm before sending
            await adminAPI.createUser(userData);
            alert('Utilisateur créé avec succès!');
            navigate('/admin/users'); // Redirect back to users list
        } catch (err) {
            setError(err.message);
            alert(`Erreur lors de la création de l'utilisateur: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.adminUserEdit}>
            <h1>Créer un nouvel utilisateur</h1>
            {error && <div className={styles.error}>{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Nom*:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={user.name}
                        onChange={handleChange}
                        required
                        minLength={2}
                        placeholder="Nom complet"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email*:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        required
                        placeholder="email@exemple.com"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="password">Mot de passe*:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={user.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        placeholder="Au moins 8 caractères (majuscule, minuscule, chiffre, symbole)"
                    />
                    <small>Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial</small>
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="passwordConfirm">Confirmer le mot de passe*:</label>
                    <input
                        type="password"
                        id="passwordConfirm"
                        name="passwordConfirm"
                        value={user.passwordConfirm}
                        onChange={handleChange}
                        required
                        minLength={8}
                        placeholder="Retapez le mot de passe"
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="address">Adresse:</label>
                    <textarea
                        id="address"
                        name="address"
                        value={user.address}
                        onChange={handleChange}
                        placeholder="Adresse complète (optionnel)"
                        rows={3}
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="role">Rôle*:</label>
                    <select id="role" name="role" value={user.role} onChange={handleChange}>
                        <option value="client">Client</option>
                        <option value="producteur">Producteur</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className={styles.buttonGroup}>
                    <button type="submit" disabled={submitting} className={styles.submitButton}>
                        {submitting ? 'Création...' : 'Créer l\'utilisateur'}
                    </button>
                    <button 
                        type="button" 
                        onClick={() => navigate('/admin/users')} 
                        disabled={submitting}
                        className={styles.cancelButton}
                    >
                        Annuler
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminUserCreate;

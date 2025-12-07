import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import styles from './AdminUserEdit.module.scss'; // Assuming a SCSS module for styling

const AdminUserEdit = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState({ name: '', email: '', role: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await adminAPI.getUserById(userId);
                setUser(response.data); // Assuming response.data contains the user object
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUser((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminAPI.updateUser(userId, user);
            alert('User updated successfully!');
            navigate('/admin/users'); // Redirect back to users list
        } catch (err) {
            setError(err.message);
            alert(`Error updating user: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div>Loading user data...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.adminUserEdit}>
            <h1>Edit User: {user.name}</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={user.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={user.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="role">Role:</label>
                    <select id="role" name="role" value={user.role} onChange={handleChange}>
                        <option value="client">client</option>
                        <option value="producteur">producteur</option>
                        <option value="admin">admin</option>
                    </select>
                </div>
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update User'}
                </button>
                <button type="button" onClick={() => navigate('/admin/users')} disabled={submitting}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default AdminUserEdit;

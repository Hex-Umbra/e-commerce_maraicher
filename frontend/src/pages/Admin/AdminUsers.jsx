import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminUsers.module.scss';
import { useNavigate } from 'react-router-dom';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const data = await adminAPI.getAllUsers();
            console.log('Users response:', data);
            setUsers(data.data || []);
        } catch (err) {
            console.error('Users error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDeleteUser = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await adminAPI.deleteUser(userId);
                alert('User deleted successfully!');
                fetchUsers(); // Refresh the list
            } catch (err) {
                setError(err.message);
                alert(`Error deleting user: ${err.message}`);
            }
        }
    };

    const handleEditUser = (userId) => {
        // Navigate to a user edit page. You'll need to create this page.
        navigate(`/admin/users/edit/${userId}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.users}>
            <div className={styles.header}>
                <h1>Users Management</h1>
                <button 
                    className={styles.createButton} 
                    onClick={() => navigate('/admin/users/create')}
                >
                    + Créer un utilisateur
                </button>
            </div>
            {users.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No users found.</p>
                </div>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                        <tr key={user._id}>
                            <td>{user._id}</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.role}</td>
                            <td>
                                <button
                                    className={styles.button}
                                    onClick={() => handleEditUser(user._id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className={`${styles.button} ${styles.deleteButton}`}
                                    onClick={() => handleDeleteUser(user._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};export default AdminUsers;

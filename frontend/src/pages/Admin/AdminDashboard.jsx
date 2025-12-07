import { useEffect, useState } from 'react';
import { adminAPI } from '../../../services/api';
import styles from './AdminDashboard.module.scss';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ users: 0, products: 0, orders: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminAPI.getDashboardStats();
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.dashboard}>
            <h1>Admin Dashboard</h1>
            <div className={styles.stats}>
                <div className={styles.statCard}>
                    <h2>Users</h2>
                    <p>{stats.users}</p>
                </div>
                <div className={styles.statCard}>
                    <h2>Products</h2>
                    <p>{stats.products}</p>
                </div>
                <div className={styles.statCard}>
                    <h2>Orders</h2>
                    <p>{stats.orders}</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

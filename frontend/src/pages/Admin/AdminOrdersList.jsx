import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { adminAPI } from '../../services/api';
import styles from './AdminOrdersList.module.scss';

const AdminOrdersList = () => { // Renamed componentAdded console.log
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchOrders = async () => {
        try {
            const data = await adminAPI.getAllOrders();
            console.log('Orders response:', data);
            setOrders(data.data?.orders || []);
        } catch (err) {
            console.error('Orders error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await adminAPI.updateOrderStatus(orderId, newStatus);
            alert('Order status updated successfully!');
            fetchOrders(); // Refresh the list
        } catch (err) {
            setError(err.message);
            alert(`Error updating order status: ${err.message}`);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.orders}>
            <h1>Orders Management</h1>
            {orders.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No orders found.</p>
                </div>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr><th>ID</th><th>Client</th><th>Products</th><th>Total</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id}>
                                <td>{order._id}</td>
                                <td>{order.clientId ? order.clientId.name : 'N/A'}</td>
                                <td>
                                    {order.products && order.products.length > 0 ? (
                                        <ul>
                                            {order.products.map((item, index) => (
                                                <li key={index}>
                                                    {item.productId ? item.productId.name : 'Unknown Product'} (x{item.quantity})
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'No products'
                                    )}
                                </td>
                                <td>{order.totalAmount} €</td>
                                <td>
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                        className={styles.statusSelect}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="processing">Processing</option>
                                        <option value="shipped">Shipped</option>
                                        <option value="delivered">Delivered</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td>
                                    <Link to={`/admin/orders/${order._id}/edit`}>
                                        <button className="btn btn-primary btn-sm">Edit</button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default AdminOrdersList; // Export renamed component

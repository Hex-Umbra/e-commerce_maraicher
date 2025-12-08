import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import styles from './AdminOrderEdit.module.scss'; // Assuming you'll create this SCSS module

const AdminOrderEdit = () => {
    console.log('AdminOrderEdit component rendering...');
    const { orderId } = useParams();
    console.log('AdminOrderEdit - orderId:', orderId); // Added console.log for orderId
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [productStatusChanges, setProductStatusChanges] = useState({}); // To track changes to product statuses

    const fetchOrder = async () => {
        try {
            const data = await adminAPI.getOrderById(orderId);
            setOrder(data.data.order);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const handleProductStatusChange = (productId, newStatus) => {
        setOrder(prevOrder => {
            const updatedProducts = prevOrder.products.map(item =>
                item.productId._id === productId ? { ...item, status: newStatus } : item
            );
            return { ...prevOrder, products: updatedProducts };
        });

        setProductStatusChanges(prevChanges => ({
            ...prevChanges,
            [productId]: newStatus,
        }));
    };

    const handleUpdateOrder = async () => {
        try {
            const updatesArray = Object.entries(productStatusChanges).map(([productId, status]) => ({
                productId,
                status,
            }));

            if (updatesArray.length > 0) {
                await adminAPI.updateProductStatusInOrder(orderId, updatesArray);
                alert('Order product statuses updated successfully!');
            } else {
                alert('No product status changes to save.');
            }
            navigate('/admin/orders'); // Navigate back after saving
        } catch (err) {
            console.error('Failed to update product statuses:', err);
            alert(`Error updating product statuses: ${err.message || 'Unknown error'}`);
        }
    };

    if (loading) {
        return <div>Loading order details...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!order) {
        return <div>Order not found.</div>;
    }

    // Define product status options (consider fetching from backend or a global constant)
    const productStatusOptions = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"];


    return (
        <div className={styles.adminOrderEdit}>
            <h1>Edit Order {order._id}</h1>
            <p>Client: {order.clientId ? order.clientId.name : 'N/A'} ({order.clientId ? order.clientId.email : 'N/A'})</p>
            <p>Total: {order.totalAmount} €</p>
            <p>Current Order Status: {order.status}</p>
            <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>

            <h2>Products in Order</h2>
            <table className={styles.productTable}>
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Product Status</th>
                        <th>Update Status</th>
                    </tr>
                </thead>
                <tbody>
                    {order.products.map(item => (
                        <tr key={item.productId._id}>
                            <td>{item.productId ? item.productId.name : 'Unknown Product'}</td>
                            <td>{item.quantity}</td>
                            <td>{item.price} €</td>
                            <td>{item.status}</td>
                            <td>
                                <select
                                    value={productStatusChanges[item.productId._id] || item.status}
                                    onChange={(e) => handleProductStatusChange(item.productId._id, e.target.value)}
                                >
                                    {productStatusOptions.map(option => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button onClick={handleUpdateOrder} className="btn btn-primary">Save Order Changes</button>
            <button onClick={() => navigate('/admin/orders')} className="btn btn-secondary">Back to Orders</button>
        </div>
    );
};

export default AdminOrderEdit;

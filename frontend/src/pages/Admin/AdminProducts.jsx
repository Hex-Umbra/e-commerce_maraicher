import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import styles from './AdminProducts.module.scss';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // Initialize useNavigate

    const fetchProducts = async () => {
        try {
            const data = await adminAPI.getAllProducts();
            console.log('Products response:', data);
            setProducts(data.products || []);
        } catch (err) {
            console.error('Products error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await adminAPI.deleteProduct(productId);
                alert('Product deleted successfully!');
                fetchProducts(); // Refresh the list
            } catch (err) {
                setError(err.message);
                alert(`Error deleting product: ${err.message}`);
            }
        }
    };

    const handleEditProduct = (productId) => {
        // Navigate to a product edit page. You'll need to create this page.
        navigate(`/admin/products/edit/${productId}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.products}>
            <h1>Products Management</h1>
            {products.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>No products found.</p>
                </div>
            ) : (
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                        <tr key={product._id}>
                            <td>{product._id}</td>
                            <td>
                                {product.image && (
                                    <img src={product.image} alt={product.name} className={styles.productImage} />
                                )}
                            </td>
                            <td>{product.name}</td>
                            <td>{product.price} €</td>
                            <td>{product.quantity}</td>
                            <td>
                                <button
                                    className={styles.button}
                                    onClick={() => handleEditProduct(product._id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className={`${styles.button} ${styles.deleteButton}`}
                                    onClick={() => handleDeleteProduct(product._id)}
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
};

export default AdminProducts;

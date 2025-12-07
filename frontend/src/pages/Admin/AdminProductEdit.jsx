import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import styles from './AdminProductEdit.module.scss'; // Assuming you'll create this SCSS module

const AdminProductEdit = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        quantity: '',
        category: '',
        image: '',
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await adminAPI.getProductById(productId);
                setProduct(response.data.product); // Assuming response.data.product contains the product object
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prevProduct) => ({ ...prevProduct, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await adminAPI.updateProduct(productId, product);
            alert('Product updated successfully!');
            navigate('/admin/products'); // Redirect back to products list
        } catch (err) {
            setError(err.message);
            alert(`Error updating product: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div>Loading product data...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.adminProductEdit}>
            <h1>Edit Product: {product.name}</h1>
            <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                    <label htmlFor="name">Name:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="description">Description:</label>
                    <textarea
                        id="description"
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="price">Price:</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="quantity">Quantity:</label>
                    <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        value={product.quantity}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="category">Category:</label>
                    <input
                        type="text"
                        id="category"
                        name="category"
                        value={product.category}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className={styles.formGroup}>
                    <label htmlFor="image">Image URL:</label>
                    <input
                        type="text"
                        id="image"
                        name="image"
                        value={product.image}
                        onChange={handleChange}
                        // Image is optional or handled separately, so not required here
                    />
                </div>
                <button type="submit" disabled={submitting}>
                    {submitting ? 'Updating...' : 'Update Product'}
                </button>
                <button type="button" onClick={() => navigate('/admin/products')} disabled={submitting}>
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default AdminProductEdit;

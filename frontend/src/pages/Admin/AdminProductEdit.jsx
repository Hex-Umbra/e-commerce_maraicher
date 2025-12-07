import React from 'react';
import { useParams } from 'react-router-dom';

const AdminProductEdit = () => {
    const { productId } = useParams();
    return (
        <div>
            <h1>Edit Product</h1>
            <p>Editing product with ID: {productId}</p>
            {/* Product editing form will go here */}
        </div>
    );
};

export default AdminProductEdit;

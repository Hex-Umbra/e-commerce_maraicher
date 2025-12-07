import React from 'react';
import { useParams } from 'react-router-dom';

const AdminUserEdit = () => {
    const { userId } = useParams();
    return (
        <div>
            <h1>Edit User</h1>
            <p>Editing user with ID: {userId}</p>
            {/* User editing form will go here */}
        </div>
    );
};

export default AdminUserEdit;

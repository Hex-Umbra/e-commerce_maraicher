import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminOrders = () => {
  return (
    <>
      <h2>Admin Orders Section</h2> {/* Added a header for testing */}
      <Outlet />
    </>
  );
};

export default AdminOrders;
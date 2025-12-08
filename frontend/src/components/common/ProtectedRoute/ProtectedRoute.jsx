import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
    const { user, isAuthenticated, loading } = useAuth(); // Destructure loading

    if (loading) {
        return <div>Loading...</div>; // Render loading indicator while authentication status is being determined
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
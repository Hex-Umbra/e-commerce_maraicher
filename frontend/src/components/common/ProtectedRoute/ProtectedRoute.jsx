import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
    const { user, isAuthenticated } = useAuth();

    console.log('ProtectedRoute: isAuthenticated =', isAuthenticated);
    console.log('ProtectedRoute: user =', user);
    console.log('ProtectedRoute: requiredRole =', requiredRole);

    if (!isAuthenticated) {
        console.log('ProtectedRoute: Not authenticated, redirecting to /login');
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.role !== requiredRole) {
        console.log('ProtectedRoute: User role mismatch, redirecting to /');
        return <Navigate to="/" replace />;
    }

    console.log('ProtectedRoute: Access granted');
    return <Outlet />;
};

export default ProtectedRoute;

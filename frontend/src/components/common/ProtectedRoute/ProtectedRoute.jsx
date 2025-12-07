import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const ProtectedRoute = ({ requiredRole }) => {
    const { user, isAuthenticated, loading } = useAuth(); // Destructure loading

    console.log('ProtectedRoute: isAuthenticated =', isAuthenticated);
    console.log('ProtectedRoute: user =', user);
    console.log('ProtectedRoute: requiredRole =', requiredRole);
    console.log('ProtectedRoute: loading =', loading); // Log loading state

    if (loading) {
        console.log('ProtectedRoute: Loading authentication status...');
        return <div>Loading...</div>; // Render loading indicator while authentication status is being determined
    }

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

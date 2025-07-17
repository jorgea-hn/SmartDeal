import { Navigate } from 'react-router-dom';
import { authService } from '../components/Form';

export function ProtectedRoute({ children, requiredRole, requiredRoles }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getCurrentUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && (!user || user.role !== requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && (!user || !requiredRoles.includes(user.role))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Loading } from '../components/ui/index.js';

// Waits for the session to resolve, then either renders or redirects to /login.
export function ProtectedRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth();
  const location = useLocation();
  if (isLoading) return <Loading label="Checking session…" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

// Additionally restricts by role. Non-matching authenticated users → 403.
export function RoleRoute({ roles, children }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (isLoading) return <Loading label="Checking access…" />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/admin/403" replace />;
  return children;
}

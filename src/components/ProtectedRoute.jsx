// components/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ 
  children, 
  requiredRole = null, // 'buyer', 'supplier', or null for any authenticated user
  requireVerified = false // Require email verification
}) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Wait for auth to load
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If email verification is required and user is not verified
  if (requireVerified && !user?.isEmailVerified) {
    return <Navigate to="/verify-email" state={{ from: location }} replace />;
  }

  // If role is required and user doesn't have it
  if (requiredRole && user?.accountType !== requiredRole && user?.account_type !== requiredRole) {
    // Redirect to dashboard or home
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
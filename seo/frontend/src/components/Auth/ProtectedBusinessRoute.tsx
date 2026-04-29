import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedBusinessRouteProps {
  children: React.ReactNode;
}

const ProtectedBusinessRoute: React.FC<ProtectedBusinessRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/business-signin" replace />;
  }

  // Check if user is a regular user (not a company)
  if (user?.role === 'user') {
    return <Navigate to="/user-dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedBusinessRoute;

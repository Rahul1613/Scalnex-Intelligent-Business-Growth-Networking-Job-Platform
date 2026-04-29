import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedUserRouteProps {
  children: React.ReactNode;
}

const ProtectedUserRoute: React.FC<ProtectedUserRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/user-login" replace />;
  }

  // Check if user is a company user
  if (user?.role !== 'user') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedUserRoute;

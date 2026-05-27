import React from 'react';
import { Navigate } from 'react-router-dom';

export const Login: React.FC = () => {
  // Redirection to landing where the login is integrated
  return <Navigate to="/" replace />;
};
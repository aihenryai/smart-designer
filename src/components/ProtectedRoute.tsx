// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <div className="text-center">
          <div className="relative mb-12">
            <div className="w-28 h-28 rounded-full border border-white/5 flex items-center justify-center relative bg-slate-900/50 backdrop-blur-sm">
              <div className="absolute inset-0 border-t-2 border-r-2 border-fuchsia-500 rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-b-2 border-l-2 border-violet-500 rounded-full animate-spin reverse duration-[1.5s]"></div>
              <div className="w-20 h-20 bg-gradient-to-tr from-violet-600 to-fuchsia-600 rounded-full blur-2xl animate-pulse opacity-50"></div>
            </div>
          </div>
          <p className="text-slate-400 animate-pulse">טוען...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

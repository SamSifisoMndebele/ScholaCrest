import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types';
import { ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, switchRole } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center font-sans">
          <div className="w-8 h-8 border-4 border-crest-navy border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-bold">Verifying Session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const requiredRole = allowedRoles[0];
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-crest-navy font-serif">Role Privileges Required</h2>
          <p className="text-xs text-slate-600 mt-2 mb-6 leading-relaxed">
            This module requires <strong>{requiredRole.replace('_', ' ').toUpperCase()}</strong> authority. Your current active role is <strong>{user.role.replace('_', ' ').toUpperCase()}</strong>.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => switchRole(requiredRole)}
              className="w-full py-2.5 px-4 rounded-xl bg-crest-navy hover:bg-crest-navyDark text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Switch to {requiredRole.replace('_', ' ').toUpperCase()}
            </button>
            <Link
              to="/portal"
              className="block w-full py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              Go to My Authorized Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

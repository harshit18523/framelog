import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoaderCircleIcon } from 'lucide-react';

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-canvas flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gold/15 flex items-center justify-center border border-gold/30">
            <span className="text-gold font-bold text-sm">FL</span>
          </div>
          <span className="font-semibold text-fg tracking-display text-lg">FrameLog</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-fg-subtle">
          <LoaderCircleIcon size={16} className="animate-spin text-gold" />
          <span>Loading session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;

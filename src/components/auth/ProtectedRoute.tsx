import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiFetch } from '../../lib/api';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [state, setState] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/admin/session')
      .then((response) => {
        if (cancelled) return;
        setState(response.ok ? 'authenticated' : 'unauthenticated');
      })
      .catch(() => {
        if (!cancelled) setState('unauthenticated');
      });
    return () => { cancelled = true; };
  }, [location.pathname]);

  if (state === 'checking') {
    return <div className="min-h-screen bg-[#F9F9F9] px-6 py-20 text-center text-sm text-gray-500">Verificando sesión…</div>;
  }

  if (state === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}

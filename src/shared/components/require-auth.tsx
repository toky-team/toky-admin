import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuthStore } from '~/features/auth/store/auth-state';

export default function RequireAuth() {
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

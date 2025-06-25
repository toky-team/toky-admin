import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { useLoadingStore } from '~/features/loading/store/loading-store';

export function useNavigationLoading() {
  const location = useLocation();
  const setLoading = useLoadingStore((state) => state.setLoading);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timeout);
  }, [location.pathname, setLoading]);
}

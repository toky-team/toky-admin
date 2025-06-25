import { useEffect, useState } from 'react';

import { fetchMe } from '~/features/auth/service/auth-service';
import { useAuthStore } from '~/features/auth/store/auth-state';

export const useAuthInit = () => {
  const [loading, setLoading] = useState(true);
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    const init = async () => {
      try {
        const { data } = await fetchMe();
        setUser(data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [setUser]);

  return { loading };
};

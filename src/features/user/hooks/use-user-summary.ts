import { useEffect, useState } from 'react';

import { fetchUserSummary } from '~/features/user/service/user-service';
import type { UserSummary } from '~/features/user/types/user-summary';

export function useUserSummary() {
  const [data, setData] = useState<UserSummary | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const getData = async () => {
    try {
      const res = await fetchUserSummary();
      setData(res.data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  useEffect(() => {
    getData(); // 첫 요청

    const interval = setInterval(() => {
      getData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return { data, error };
}

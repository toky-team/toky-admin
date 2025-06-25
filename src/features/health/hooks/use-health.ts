import { useEffect, useState } from 'react';

import { fetchHealth } from '~/features/health/service/health-service';
import type { Health } from '~/features/health/types/health';

export function useHealth() {
  const [data, setData] = useState<Health | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const getData = async () => {
    try {
      const res = await fetchHealth();
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

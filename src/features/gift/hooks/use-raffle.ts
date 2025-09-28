import { useCallback, useState } from 'react';

import { raffleDraw } from '~/features/gift/service/gift-service';
import type { RaffleResult } from '~/features/gift/types/raffle-result';

interface RaffleState {
  results: RaffleResult[];
  excludeDrawIds: string[];
}

interface RaffleOptions {
  raffleCount: number;
  includeAdmin?: boolean;
}

export function useRaffle(giftId?: string) {
  const [state, setState] = useState<RaffleState>({
    results: [],
    excludeDrawIds: [],
  });
  const [error, setError] = useState<Error | null>(null);

  // 추첨 실행
  const executeRaffle = useCallback(
    async (options: RaffleOptions) => {
      if (!giftId) {
        throw new Error('경품 ID가 필요합니다.');
      }

      setError(null);

      try {
        const response = await raffleDraw(giftId, options.raffleCount, state.excludeDrawIds, options.includeAdmin);

        const newResults = response.data;
        const newExcludeIds = newResults.map((result) => result.drawId);

        setState((prev) => ({
          ...prev,
          results: [...prev.results, ...newResults],
          excludeDrawIds: [...prev.excludeDrawIds, ...newExcludeIds],
        }));

        return newResults;
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [giftId, state.excludeDrawIds]
  );

  // 추첨 상태 초기화
  const resetRaffle = useCallback(() => {
    setState({
      results: [],
      excludeDrawIds: [],
    });
    setError(null);
  }, []);

  return {
    // 상태
    results: state.results,
    excludeDrawIds: state.excludeDrawIds,
    error,

    // 액션
    executeRaffle,
    resetRaffle,

    // 통계
    totalWinners: state.results.length,
    hasResults: state.results.length > 0,
  };
}

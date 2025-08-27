import { useCallback, useState } from 'react';

import { incrementTicket } from '~/features/user/service/ticket-service';

export function useTicket() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 티켓 지급
  const giveTicket = useCallback(async (userId: string, count: number, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await incrementTicket(userId, count, reason);

      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 여러 사용자에게 티켓 지급
  const giveTicketToMultipleUsers = useCallback(async (userIds: string[], count: number, reason: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // 병렬로 모든 사용자에게 티켓 지급
      await Promise.all(userIds.map((userId) => incrementTicket(userId, count, reason)));

      return true;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 에러 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    isLoading,
    error,

    // 액션
    giveTicket,
    giveTicketToMultipleUsers,
    clearError,
  };
}

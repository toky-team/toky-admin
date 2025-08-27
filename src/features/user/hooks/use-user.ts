import { useCallback, useState } from 'react';

import type { User } from '~/features/auth/types/user';
import { fetchUserSummary, getUsers } from '~/features/user/service/user-service';
import type { UserSummary } from '~/features/user/types/user-summary';

export function useUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [userSummary, setUserSummary] = useState<UserSummary | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // 사용자 목록 조회
  const loadUsers = useCallback(async (name?: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getUsers(name);
      setUsers(response.data);
      setSearchQuery(name || '');
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 사용자 검색
  const searchUsers = useCallback(
    async (name: string) => {
      await loadUsers(name);
    },
    [loadUsers]
  );

  // 모든 사용자 조회 (검색 초기화)
  const loadAllUsers = useCallback(async () => {
    await loadUsers();
  }, [loadUsers]);

  // 사용자 요약 정보 조회
  const loadUserSummary = useCallback(async () => {
    try {
      setError(null);

      const response = await fetchUserSummary();
      setUserSummary(response.data);
    } catch (err) {
      setError(err as Error);
    }
  }, []);

  // 사용자 목록 새로고침
  const refreshUsers = useCallback(async () => {
    if (searchQuery) {
      await searchUsers(searchQuery);
    } else {
      await loadAllUsers();
    }
  }, [searchQuery, searchUsers, loadAllUsers]);

  // 특정 사용자 ID로 사용자 찾기
  const findUserById = useCallback(
    (userId: string) => {
      return users.find((user) => user.id === userId);
    },
    [users]
  );

  // 대학별 사용자 개수 가져오기
  const getUserCountByUniversity = useCallback(() => {
    const universityCount = new Map<string, number>();

    users.forEach((user) => {
      const count = universityCount.get(user.university) || 0;
      universityCount.set(user.university, count + 1);
    });

    return Object.fromEntries(universityCount);
  }, [users]);

  return {
    // 상태
    users,
    userSummary,
    error,
    isLoading,
    searchQuery,

    // 액션
    loadUsers,
    searchUsers,
    loadAllUsers,
    loadUserSummary,
    refreshUsers,
    findUserById,
    getUserCountByUniversity,
  };
}

import { useEffect, useState } from 'react';

import { createPlayer, deletePlayer, getPlayers, updatePlayer } from '~/features/player/service/player-service';
import type { Player } from '~/features/player/types/player';
import { Sport } from '~/shared/types/sport';
import { University } from '~/shared/types/university';

export function usePlayer() {
  const [players, setPlayers] = useState<Record<Sport, Record<University, Player[]>>>({
    [Sport.FOOTBALL]: {
      [University.KOREA_UNIVERSITY]: [],
      [University.YONSEI_UNIVERSITY]: [],
    },
    [Sport.BASKETBALL]: {
      [University.KOREA_UNIVERSITY]: [],
      [University.YONSEI_UNIVERSITY]: [],
    },
    [Sport.BASEBALL]: {
      [University.KOREA_UNIVERSITY]: [],
      [University.YONSEI_UNIVERSITY]: [],
    },
    [Sport.RUGBY]: {
      [University.KOREA_UNIVERSITY]: [],
      [University.YONSEI_UNIVERSITY]: [],
    },
    [Sport.ICE_HOCKEY]: {
      [University.KOREA_UNIVERSITY]: [],
      [University.YONSEI_UNIVERSITY]: [],
    },
  });
  const [error, setError] = useState<Error | null>(null);

  const createEmptyPlayerStructure = (): Record<Sport, Record<University, Player[]>> => ({
    [Sport.FOOTBALL]: {
      [University.KOREA_UNIVERSITY]: [],
      [University.YONSEI_UNIVERSITY]: [],
    },
    [Sport.BASKETBALL]: {
      [University.KOREA_UNIVERSITY]: [],
      [University.YONSEI_UNIVERSITY]: [],
    },
    [Sport.BASEBALL]: {
      [University.KOREA_UNIVERSITY]: [],
      [University.YONSEI_UNIVERSITY]: [],
    },
    [Sport.RUGBY]: {
      [University.KOREA_UNIVERSITY]: [],
      [University.YONSEI_UNIVERSITY]: [],
    },
    [Sport.ICE_HOCKEY]: {
      [University.KOREA_UNIVERSITY]: [],
      [University.YONSEI_UNIVERSITY]: [],
    },
  });

  const fetchAll = async () => {
    try {
      const response = await getPlayers();
      const newPlayers = createEmptyPlayerStructure();

      response.data.forEach((player) => {
        newPlayers[player.sport][player.university].push(player);
      });

      setPlayers(newPlayers);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchAll();
  }, []);

  const fetchPlayers = async (sport?: Sport, university?: University) => {
    try {
      const response = await getPlayers(sport, university);

      if (sport && university) {
        // 특정 종목, 대학만 업데이트
        setPlayers((prev) => ({
          ...prev,
          [sport]: {
            ...prev[sport],
            [university]: response.data,
          },
        }));
      } else if (sport) {
        // 특정 종목의 모든 대학 업데이트
        const sportPlayers = {
          [University.KOREA_UNIVERSITY]: [] as Player[],
          [University.YONSEI_UNIVERSITY]: [] as Player[],
        };

        response.data.forEach((player) => {
          sportPlayers[player.university].push(player);
        });

        setPlayers((prev) => ({
          ...prev,
          [sport]: sportPlayers,
        }));
      } else {
        const newPlayers = createEmptyPlayerStructure();
        response.data.forEach((player) => {
          newPlayers[player.sport][player.university].push(player);
        });
        setPlayers(newPlayers);
      }

      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  const handleCreate = async (params: {
    name: string;
    university: University;
    sport: Sport;
    department: string;
    birth: string;
    height: number;
    weight: number;
    position: string;
    backNumber: number;
    image: File;
  }) => {
    try {
      const response = await createPlayer(params);

      // 새로운 플레이어를 기존 상태에 추가
      setPlayers((prev) => ({
        ...prev,
        [params.sport]: {
          ...prev[params.sport],
          [params.university]: [...prev[params.sport][params.university], response.data],
        },
      }));

      setError(null);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // 플레이어 수정
  const handleUpdate = async (
    playerId: string,
    params: {
      name?: string;
      university?: University;
      sport?: Sport;
      department?: string;
      birth?: string;
      height?: number;
      weight?: number;
      position?: string;
      backNumber?: number;
      image?: File;
    }
  ) => {
    try {
      const response = await updatePlayer(playerId, params);

      await fetchAll();

      setError(null);
      return response.data;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  // 플레이어 삭제
  const handleDelete = async (playerId: string, sport: Sport, university: University) => {
    try {
      await deletePlayer(playerId);

      // 상태에서 플레이어 제거
      setPlayers((prev) => ({
        ...prev,
        [sport]: {
          ...prev[sport],
          [university]: prev[sport][university].filter((p) => p.id !== playerId),
        },
      }));

      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  return {
    players,
    error,
    refetch: fetchAll,
    fetchPlayers,
    handleCreate,
    handleUpdate,
    handleDelete,
  };
}

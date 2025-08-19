import { useEffect, useState } from 'react';

import type { Like } from '~/features/like/types/like';
import webSocketManager from '~/shared/lib/websocket';
import { Sport } from '~/shared/types/sport';
import { University } from '~/shared/types/university';

interface LikeUpdateEvent {
  like: {
    sport: Sport;
    KULike: number;
    YULike: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface ErrorEvent {
  message: {
    timestamp: string;
    status: number;
    error: string;
    message: string;
    path?: string;
    context?: string;
  };
}

export function useLikeWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState<Record<Sport, Like | null>>({
    [Sport.FOOTBALL]: null,
    [Sport.BASKETBALL]: null,
    [Sport.BASEBALL]: null,
    [Sport.RUGBY]: null,
    [Sport.ICE_HOCKEY]: null,
  });

  useEffect(() => {
    // 중앙 관리 시스템을 통해 like 네임스페이스 연결
    const socket = webSocketManager.connect({ namespace: 'like' });

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);

      // 모든 종목의 좋아요 데이터를 구독
      Object.values(Sport).forEach((sport) => {
        socket.emit('join_room', { sport });
      });
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleConnectError = (err: { message: string }) => {
      setIsConnected(false);
      try {
        // connect_error는 JSON 문자열화된 ExceptionFormat을 반환
        const errorData = JSON.parse(err.message) as {
          timestamp: string;
          status: number;
          error: string;
          message: string;
          path?: string;
          context?: string;
        };
        setError(errorData.message || '연결 실패');
      } catch {
        setError('서버 연결에 실패했습니다.');
      }
    };

    const handleLikeUpdate = (data: LikeUpdateEvent) => {
      const { like } = data;
      setLikes((prev) => ({
        ...prev,
        [like.sport]: {
          sport: like.sport,
          KULike: like.KULike,
          YULike: like.YULike,
        },
      }));
    };

    const handleError = (data: ErrorEvent) => {
      setError(data.message.message || '오류가 발생했습니다.');
    };

    // 이벤트 리스너 등록
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('like_update', handleLikeUpdate);
    socket.on('error', handleError);

    // 초기 연결 상태 확인
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      // 연결된 상태에서만 구독 해제
      if (socket.connected) {
        // 모든 종목 구독 해제
        Object.values(Sport).forEach((sport) => {
          socket.emit('leave_room', { sport });
        });
      }

      // 이벤트 리스너 제거
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('like_update', handleLikeUpdate);
      socket.off('error', handleError);

      // 연결 해제는 하지 않음 - 다른 컴포넌트에서도 사용할 수 있도록
      // webSocketManager.disconnect('like');
    };
  }, []);

  const addLike = (sport: Sport, university: University, likes: number = 1) => {
    const socket = webSocketManager.getSocket('like');
    if (socket && isConnected) {
      socket.emit('add_like', { sport, university, likes });
    }
  };

  return {
    likes,
    isConnected,
    error,
    addLike,
  };
}

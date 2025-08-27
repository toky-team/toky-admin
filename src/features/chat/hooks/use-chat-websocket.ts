import { useCallback, useEffect, useState } from 'react';

import type { Chat } from '~/features/chat/types/chat';
import webSocketManager from '~/shared/lib/websocket';
import { Sport } from '~/shared/types/sport';

interface ReceiveMessageEvent {
  message: Chat;
}

interface MessageFilteredEvent {
  filteredMessage: {
    id: string;
    sport: Sport;
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

export function useChatWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedRooms, setConnectedRooms] = useState<Set<Sport>>(new Set());

  // 실시간으로 받은 새 채팅들
  const [newMessages, setNewMessages] = useState<Chat[]>([]);

  // 필터링된 채팅 ID들
  const [filteredMessageIds, setFilteredMessageIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // 중앙 관리 시스템을 통해 chat 네임스페이스 연결
    const socket = webSocketManager.connect({ namespace: 'chat' });

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setConnectedRooms(new Set());
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

    const handleReceiveMessage = (data: ReceiveMessageEvent) => {
      const { message } = data;
      // 새로운 메시지를 맨 앞에 추가 (최신순)
      setNewMessages((prev) => [message, ...prev]);
    };

    const handleMessageFiltered = (data: MessageFilteredEvent) => {
      const { filteredMessage } = data;
      // 필터링된 메시지 ID를 추가
      setFilteredMessageIds((prev) => new Set(prev).add(filteredMessage.id));
    };

    const handleError = (data: ErrorEvent) => {
      setError(data.message.message || '오류가 발생했습니다.');
    };

    // 이벤트 리스너 등록
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('message_filtered', handleMessageFiltered);
    socket.on('error', handleError);

    // 초기 연결 상태 확인
    if (socket.connected) {
      handleConnect();
    }

    return () => {
      // 연결된 상태에서만 구독 해제
      if (socket.connected) {
        // 모든 연결된 방 구독 해제
        connectedRooms.forEach((sport) => {
          socket.emit('leave_room', { sport });
        });
      }

      // 이벤트 리스너 제거
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('message_filtered', handleMessageFiltered);
      socket.off('error', handleError);
    };
  }, [connectedRooms]);

  // 채팅방 참여
  const joinRoom = useCallback(
    (sport: Sport) => {
      const socket = webSocketManager.getSocket('chat');
      if (socket && isConnected && !connectedRooms.has(sport)) {
        socket.emit('join_room', { sport });
        setConnectedRooms((prev) => new Set(prev).add(sport));
      }
    },
    [isConnected, connectedRooms]
  );

  // 채팅방 나가기
  const leaveRoom = useCallback(
    (sport: Sport) => {
      const socket = webSocketManager.getSocket('chat');
      if (socket && isConnected && connectedRooms.has(sport)) {
        socket.emit('leave_room', { sport });
        setConnectedRooms((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sport);
          return newSet;
        });
      }
    },
    [isConnected, connectedRooms]
  );

  // 메시지 전송
  const sendMessage = useCallback(
    (sport: Sport, message: string) => {
      const socket = webSocketManager.getSocket('chat');
      if (socket && isConnected) {
        socket.emit('send_message', { sport, message });
      }
    },
    [isConnected]
  );

  // 특정 종목의 새 메시지들 가져오기
  const getNewMessagesForSport = useCallback(
    (sport: Sport) => {
      return newMessages.filter((message) => message.sport === sport);
    },
    [newMessages]
  );

  // 새 메시지들을 기존 채팅 목록에 통합
  const mergeNewMessages = useCallback(
    (existingChats: Chat[], sport: Sport): Chat[] => {
      const sportNewMessages = getNewMessagesForSport(sport);
      if (sportNewMessages.length === 0) return existingChats;

      // 중복 제거를 위한 Set 생성
      const existingIds = new Set(existingChats.map((chat) => chat.id));
      const uniqueNewMessages = sportNewMessages.filter((message) => !existingIds.has(message.id));

      // 새 메시지를 맨 앞에 추가하고 시간순으로 정렬
      const merged = [...uniqueNewMessages, ...existingChats];
      return merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    },
    [getNewMessagesForSport]
  );

  // 특정 종목의 새 메시지들 초기화
  const clearNewMessagesForSport = useCallback((sport: Sport) => {
    setNewMessages((prev) => prev.filter((message) => message.sport !== sport));
  }, []);

  // 필터링된 메시지들을 제거한 채팅 목록 반환
  const filterOutDeletedMessages = useCallback(
    (chats: Chat[]): Chat[] => {
      return chats.filter((chat) => !filteredMessageIds.has(chat.id));
    },
    [filteredMessageIds]
  );

  // 전체 새 메시지 개수
  const getTotalNewMessageCount = useCallback(() => {
    return newMessages.length;
  }, [newMessages]);

  // 특정 종목의 새 메시지 개수
  const getNewMessageCountForSport = useCallback(
    (sport: Sport) => {
      return getNewMessagesForSport(sport).length;
    },
    [getNewMessagesForSport]
  );

  // 수동으로 메시지 삭제 (관리자가 삭제 버튼을 눌렀을 때)
  const removeMessageFromNewMessages = useCallback((messageId: string) => {
    setNewMessages((prev) => prev.filter((message) => message.id !== messageId));
  }, []);

  // 수동으로 여러 메시지 삭제
  const removeMessagesFromNewMessages = useCallback((messageIds: string[]) => {
    setNewMessages((prev) => prev.filter((message) => !messageIds.includes(message.id)));
  }, []);

  // 삭제된 메시지를 필터링된 상태로 표시
  const markMessageAsDeleted = useCallback(
    (messageId: string) => {
      setFilteredMessageIds((prev) => new Set(prev).add(messageId));
      // 새 메시지 목록에서도 제거
      removeMessageFromNewMessages(messageId);
    },
    [removeMessageFromNewMessages]
  );

  // 여러 메시지를 삭제된 상태로 표시
  const markMessagesAsDeleted = useCallback(
    (messageIds: string[]) => {
      setFilteredMessageIds((prev) => {
        const newSet = new Set(prev);
        messageIds.forEach((id) => newSet.add(id));
        return newSet;
      });
      // 새 메시지 목록에서도 제거
      removeMessagesFromNewMessages(messageIds);
    },
    [removeMessagesFromNewMessages]
  );

  // 삭제된 메시지를 필터링된 상태로 표시
  const markMessageAsFiltered = useCallback((messageId: string) => {
    setFilteredMessageIds((prev) => new Set([...prev, messageId]));
  }, []);

  // 삭제된 여러 메시지를 필터링된 상태로 표시
  const markMessagesAsFiltered = useCallback((messageIds: string[]) => {
    setFilteredMessageIds((prev) => new Set([...prev, ...messageIds]));
  }, []);

  return {
    // 연결 상태
    isConnected,
    error,
    connectedRooms: Array.from(connectedRooms),

    // 방 관리
    joinRoom,
    leaveRoom,

    // 메시지 전송
    sendMessage,

    // 실시간 메시지 관리
    newMessages,
    filteredMessageIds: Array.from(filteredMessageIds),
    getNewMessagesForSport,
    mergeNewMessages,
    clearNewMessagesForSport,
    filterOutDeletedMessages,
    removeMessageFromNewMessages,
    removeMessagesFromNewMessages,
    markMessageAsFiltered,
    markMessagesAsFiltered,
    markMessageAsDeleted,
    markMessagesAsDeleted,

    // 통계
    getTotalNewMessageCount,
    getNewMessageCountForSport,
  };
}

import { useState } from 'react';

import { deleteChat, getChatsWithCursor } from '~/features/chat/service/chat-service';
import type { Chat } from '~/features/chat/types/chat';
import type { Sport } from '~/shared/types/sport';

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [currentSport, setCurrentSport] = useState<Sport | null>(null);

  const fetchChats = async (sport: Sport, limit = 50, cursor?: string) => {
    try {
      const response = await getChatsWithCursor(sport, limit, cursor);

      if (cursor) {
        // 더 많은 채팅 로드 (기존에 추가)
        setChats((prev) => [...prev, ...response.data.items]);
      } else {
        // 새로운 채팅 로드 (기존 대체)
        setChats(response.data.items);
      }

      setNextCursor(response.data.nextCursor || undefined);
      setHasNextPage(response.data.hasNext);
      setCurrentSport(sport);
      setError(null);
    } catch (err) {
      setError(err as Error);
    }
  };

  const loadMoreChats = async (limit = 50) => {
    if (!hasNextPage || !currentSport || !nextCursor) return;

    await fetchChats(currentSport, limit, nextCursor);
  };

  const refetch = async () => {
    if (!currentSport) return;

    setNextCursor(undefined);
    setHasNextPage(true);
    await fetchChats(currentSport);
  };

  const handleDelete = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      setChats((prev) => prev.filter((chat) => chat.id !== chatId));
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const handleBulkDelete = async (chatIds: string[]) => {
    try {
      await Promise.all(chatIds.map((id) => deleteChat(id)));
      setChats((prev) => prev.filter((chat) => !chatIds.includes(chat.id)));
      setError(null);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  };

  const loadChatsBySport = async (sport: Sport) => {
    setNextCursor(undefined);
    setHasNextPage(true);
    await fetchChats(sport);
  };

  return {
    chats,
    error,
    hasNextPage,
    currentSport,
    loadChatsBySport,
    loadMoreChats,
    refetch,
    handleDelete,
    handleBulkDelete,
  };
}

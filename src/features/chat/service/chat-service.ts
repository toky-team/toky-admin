import type { Chat } from '~/features/chat/types/chat';
import api from '~/shared/lib/api';
import type { PaginatedResult } from '~/shared/types/paginated-result';
import type { Sport } from '~/shared/types/sport';

export const getChatsWithCursor = async (sport: Sport, limit: number, cursor?: string) => {
  return await api.get<PaginatedResult<Chat>>('/chat/messages', {
    params: { sport, limit, cursor },
  });
};

export const deleteChat = async (chatId: string) => {
  return await api.delete<void>(`/admin/chat/${chatId}`);
};

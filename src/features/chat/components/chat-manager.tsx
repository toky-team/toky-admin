import { useCallback, useEffect, useRef, useState } from 'react';

import { useChat } from '~/features/chat/hooks/use-chat';
import { useChatWebSocket } from '~/features/chat/hooks/use-chat-websocket';
import { deleteChat } from '~/features/chat/service/chat-service';
import { emojiMap, Sport } from '~/shared/types/sport';
import { University } from '~/shared/types/university';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';

export function ChatManager() {
  const { chats, error, hasNextPage, currentSport, loadChatsBySport, loadMoreChats } = useChat();

  const {
    isConnected: wsConnected,
    joinRoom,
    leaveRoom,
    mergeNewMessages,
    filteredMessageIds,
    markMessageAsDeleted,
    markMessagesAsDeleted,
  } = useChatWebSocket();

  const [selectedChatIds, setSelectedChatIds] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadLimit, setLoadLimit] = useState(50); // 한 번에 불러올 채팅 개수
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // 검색된 채팅 필터링 (필터링된 메시지들은 유지하되 표시만 다르게)
  const getFilteredChats = useCallback(() => {
    if (!searchQuery) return chats;

    const query = searchQuery.toLowerCase();
    return chats.filter(
      (chat) =>
        chat.content.toLowerCase().includes(query) ||
        chat.username.toLowerCase().includes(query) ||
        chat.university.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  // 실시간 채팅과 기존 채팅 통합
  const getMergedChats = useCallback(() => {
    if (!currentSport) return [];

    const filtered = getFilteredChats();
    return mergeNewMessages(filtered, currentSport);
  }, [currentSport, getFilteredChats, mergeNewMessages]);

  // 메시지가 필터링되었는지 확인하는 함수
  const isMessageFiltered = useCallback(
    (messageId: string) => {
      return filteredMessageIds.includes(messageId);
    },
    [filteredMessageIds]
  );

  // 무한 스크롤 설정
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage) {
          loadMoreChats(loadLimit);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [hasNextPage, loadMoreChats, loadLimit]);

  // 컴포넌트 언마운트 시 웹소켓 방 나가기
  useEffect(() => {
    return () => {
      if (currentSport) {
        leaveRoom(currentSport);
      }
    };
  }, [currentSport, leaveRoom]);

  // 종목 선택 핸들러 (웹소켓 방 관리 포함)
  const handleSportSelect = useCallback(
    (sport: Sport) => {
      // 이전 종목에서 나가기
      if (currentSport) {
        leaveRoom(currentSport);
      }

      setSelectedChatIds(new Set());
      setSearchQuery('');

      // 새 종목 채팅 로드
      loadChatsBySport(sport).catch(() => {
        // Error is handled in useChat hook
      });

      // 웹소켓 방 참여
      joinRoom(sport);
    },
    [loadChatsBySport, joinRoom, leaveRoom, currentSport]
  );

  // 채팅 선택/해제
  const toggleChatSelection = useCallback((chatId: string) => {
    setSelectedChatIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(chatId)) {
        newSet.delete(chatId);
      } else {
        newSet.add(chatId);
      }
      return newSet;
    });
  }, []);

  // 전체 선택/해제
  const toggleAllSelection = useCallback(() => {
    const filteredChats = getMergedChats();
    if (selectedChatIds.size === filteredChats.length) {
      setSelectedChatIds(new Set());
    } else {
      setSelectedChatIds(new Set(filteredChats.map((chat) => chat.id)));
    }
  }, [getMergedChats, selectedChatIds.size]);

  // 개별 삭제 (삭제 API 호출 + UI에서는 필터링된 상태로 표시)
  const handleSingleDelete = useCallback(
    async (chatId: string) => {
      if (!confirm('이 채팅을 삭제하시겠습니까?')) return;

      try {
        setIsDeleting(true);

        // 실제 삭제 API 호출 (상태 변경 없이)
        await deleteChat(chatId);

        // UI에서는 삭제된 상태로 표시 (필터링된 UI 사용)
        markMessageAsDeleted(chatId);

        setSelectedChatIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(chatId);
          return newSet;
        });
      } catch {
        alert('채팅 삭제에 실패했습니다.');
      } finally {
        setIsDeleting(false);
      }
    },
    [markMessageAsDeleted]
  );

  // 선택된 채팅들 삭제 (삭제 API 호출 + UI에서는 필터링된 상태로 표시)
  const handleSelectedDelete = useCallback(async () => {
    if (selectedChatIds.size === 0) return;
    if (!confirm(`선택된 ${selectedChatIds.size}개의 채팅을 삭제하시겠습니까?`)) return;

    try {
      setIsDeleting(true);
      const chatIdsArray = Array.from(selectedChatIds);

      // 실제 삭제 API 호출 (각각 개별적으로, 상태 변경 없이)
      await Promise.all(chatIdsArray.map((id) => deleteChat(id)));

      // UI에서는 삭제된 상태로 표시 (필터링된 UI 사용)
      markMessagesAsDeleted(chatIdsArray);

      setSelectedChatIds(new Set());
    } catch {
      alert('채팅 삭제에 실패했습니다.');
    } finally {
      setIsDeleting(false);
    }
  }, [selectedChatIds, markMessagesAsDeleted]);

  // 대학교 한글 이름 변환
  const getUniversityDisplayName = (university: University) => {
    return university === University.KOREA_UNIVERSITY ? '고려대' : '연세대';
  };

  const filteredChats = getMergedChats();

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">채팅 관리</h1>
            <p className="text-muted-foreground mt-1">종목별 채팅을 조회하고 관리할 수 있습니다.</p>
          </div>

          {/* 웹소켓 연결 상태 */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">{wsConnected ? '실시간 연결됨' : '연결 끊김'}</span>
          </div>
        </div>
      </div>

      {/* 종목 선택 */}
      <Card>
        <h2 className="text-lg font-semibold mb-4">종목 선택</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {Object.values(Sport).map((sport) => (
            <Button
              key={sport}
              variant={currentSport === sport ? 'primary' : 'outline'}
              onClick={() => handleSportSelect(sport)}
              className="flex items-center gap-2"
            >
              <span>{emojiMap[sport]}</span>
              {sport}
            </Button>
          ))}
        </div>
      </Card>

      {currentSport && (
        <>
          {/* 검색 및 액션 바 */}
          <Card>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="채팅 내용, 사용자명, 대학교로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">총 {filteredChats.length}개 채팅</span>

                {/* 더 많이 불러오기 옵션 */}
                {hasNextPage && (
                  <div className="flex items-center gap-2">
                    <select
                      value={loadLimit}
                      onChange={(e) => setLoadLimit(Number(e.target.value))}
                      className="px-2 py-1 border border-border rounded text-sm bg-background text-foreground"
                    >
                      <option value={50}>50개씩</option>
                      <option value={100}>100개씩</option>
                      <option value={200}>200개씩</option>
                      <option value={500}>500개씩</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        loadMoreChats(loadLimit).catch(() => {
                          // Error is handled in useChat hook
                        });
                      }}
                    >
                      더 불러오기
                    </Button>
                  </div>
                )}

                {selectedChatIds.size > 0 && (
                  <>
                    <span className="text-sm text-primary">{selectedChatIds.size}개 선택</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        handleSelectedDelete().catch(() => {
                          // Error is handled in the function
                        });
                      }}
                      disabled={isDeleting}
                    >
                      선택 삭제
                    </Button>
                  </>
                )}

                <Button variant="outline" size="sm" onClick={toggleAllSelection} disabled={filteredChats.length === 0}>
                  {selectedChatIds.size === filteredChats.length ? '전체 해제' : '전체 선택'}
                </Button>
              </div>
            </div>
          </Card>

          {/* 채팅 목록 */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <p className="text-red-600">채팅을 불러오는 중 오류가 발생했습니다: {error.message}</p>
            </Card>
          )}

          <div className="space-y-3">
            {filteredChats.length === 0 ? (
              <Card>
                <p className="text-center text-muted-foreground py-8">
                  {chats.length === 0 ? '채팅이 없습니다.' : '검색 결과가 없습니다.'}
                </p>
              </Card>
            ) : (
              filteredChats.map((chat) => {
                const isFiltered = isMessageFiltered(chat.id);
                return (
                  <Card key={chat.id} className={`relative ${isFiltered ? 'bg-red-50 border-red-200' : ''}`}>
                    <div className="flex items-start gap-4">
                      {/* 선택 체크박스 */}
                      <input
                        type="checkbox"
                        checked={selectedChatIds.has(chat.id)}
                        onChange={() => toggleChatSelection(chat.id)}
                        className="mt-1 w-4 h-4 text-primary rounded border-border focus:ring-primary"
                      />

                      {/* 채팅 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-foreground">{chat.username}</span>
                          <span className="px-2 py-1 text-xs rounded-full bg-border text-muted-foreground">
                            {getUniversityDisplayName(chat.university)}
                          </span>
                          <span className="text-sm text-muted-foreground">{chat.createdAt}</span>
                          {isFiltered && (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-500 text-white">삭제됨</span>
                          )}
                        </div>

                        {isFiltered ? (
                          <p className="text-gray-500 leading-relaxed">삭제되었습니다</p>
                        ) : (
                          <p className="text-foreground leading-relaxed break-words">{chat.content}</p>
                        )}

                        {chat.deletedAt && <div className="mt-2 text-sm text-red-500">삭제됨: {chat.deletedAt}</div>}
                      </div>

                      {/* 삭제 버튼 - 필터링되지 않은 메시지만 표시 */}
                      {!chat.deletedAt && !isFiltered && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            handleSingleDelete(chat.id).catch(() => {
                              // Error is handled in the function
                            });
                          }}
                          disabled={isDeleting}
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })
            )}
          </div>

          {/* 더 불러오기 영역 */}
          {hasNextPage && (
            <Card>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">더 많은 채팅이 있습니다</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      loadMoreChats(loadLimit).catch(() => {
                        // Error is handled in useChat hook
                      });
                    }}
                  >
                    {loadLimit}개 더 불러오기
                  </Button>
                </div>
              </div>
              {/* 무한 스크롤 트리거 (화면에 보이지 않음) */}
              <div ref={loadMoreRef} className="h-1" />
            </Card>
          )}

          {!hasNextPage && chats.length > 0 && (
            <Card>
              <p className="text-center text-muted-foreground py-4">모든 채팅을 불러왔습니다.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

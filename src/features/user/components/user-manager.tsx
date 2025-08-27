import { useCallback, useEffect, useState } from 'react';

import type { User } from '~/features/auth/types/user';
import { useTicket } from '~/features/user/hooks/use-ticket';
import { useUser } from '~/features/user/hooks/use-user';
import { University } from '~/shared/types/university';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';

export function UserManager() {
  const { users, error: userError, isLoading: isLoadingUsers, searchUsers, loadAllUsers } = useUser();

  const { giveTicket, isLoading: isGivingTicket, error: ticketError } = useTicket();

  const [searchInput, setSearchInput] = useState('');
  const [ticketCount, setTicketCount] = useState<number>(1);
  const [ticketReason, setTicketReason] = useState('');
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [targetUser, setTargetUser] = useState<User | null>(null);

  // 컴포넌트 마운트시 사용자 목록 로드
  useEffect(() => {
    loadAllUsers().catch(() => {
      // Error is handled in the hook
    });
  }, [loadAllUsers]);

  // 대학교 한글 이름 변환
  const getUniversityDisplayName = (university: string) => {
    const universityMap: Record<string, string> = {
      [University.KOREA_UNIVERSITY]: '고려대학교',
      [University.YONSEI_UNIVERSITY]: '연세대학교',
    };
    return universityMap[university] || university;
  };

  // 사용자 검색 핸들러
  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchInput.trim()) {
        searchUsers(searchInput.trim()).catch(() => {
          // Error is handled in the hook
        });
      } else {
        loadAllUsers().catch(() => {
          // Error is handled in the hook
        });
      }
    },
    [searchInput, searchUsers, loadAllUsers]
  );

  // 개별 티켓 지급 모달 열기
  const openTicketModal = useCallback((user: User) => {
    setTargetUser(user);
    setTicketCount(1);
    setTicketReason('');
    setShowTicketModal(true);
  }, []);

  // 개별 티켓 지급
  const handleGiveTicket = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!targetUser || !ticketReason.trim() || ticketCount <= 0) {
        alert('모든 필드를 올바르게 입력해주세요.');
        return;
      }

      giveTicket(targetUser.id, ticketCount, ticketReason.trim())
        .then(() => {
          alert(`${targetUser.name}님에게 티켓 ${ticketCount}개를 지급했습니다.`);
          setShowTicketModal(false);
          setTargetUser(null);
          setTicketCount(1);
          setTicketReason('');
        })
        .catch(() => {
          alert('티켓 지급에 실패했습니다.');
        });
    },
    [targetUser, ticketCount, ticketReason, giveTicket]
  );

  return (
    <div className="space-y-6">
      {/* 검색 */}
      <Card>
        <div className="p-4">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="search-input">사용자 검색</Label>
              <Input
                id="search-input"
                type="text"
                placeholder="이름으로 검색..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={isLoadingUsers} className="self-end">
              {isLoadingUsers ? '검색 중...' : '검색'}
            </Button>
          </form>
        </div>
      </Card>

      {/* 에러 표시 */}
      {(userError || ticketError) && (
        <Card className="border-red-200 bg-red-50">
          <div className="p-4">
            <p className="text-red-600">오류가 발생했습니다: {userError?.message || ticketError?.message}</p>
          </div>
        </Card>
      )}

      {/* 사용자 목록 */}
      <Card>
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">사용자 목록 ({users.length}명)</h2>

          {isLoadingUsers ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">사용자 목록을 불러오는 중...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">사용자가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id} className="relative">
                  <div className="flex items-center justify-between p-4">
                    {/* 사용자 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{user.name}</span>
                        <span className="px-2 py-1 text-xs rounded-full bg-border text-muted-foreground">
                          {getUniversityDisplayName(user.university)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>전화번호: {user.phoneNumber}</div>
                        <div>가입일: {user.createdAt}</div>
                      </div>
                    </div>

                    {/* 티켓 지급 버튼 */}
                    <Button size="sm" onClick={() => openTicketModal(user)} disabled={isGivingTicket}>
                      티켓 지급
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* 티켓 지급 모달 */}
      {showTicketModal && targetUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">{targetUser.name}님에게 티켓 지급</h3>

              <form onSubmit={handleGiveTicket} className="space-y-4">
                <div>
                  <Label htmlFor="ticket-count">티켓 개수</Label>
                  <Input
                    id="ticket-count"
                    type="number"
                    min="1"
                    value={ticketCount}
                    onChange={(e) => setTicketCount(parseInt(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="ticket-reason">지급 사유</Label>
                  <Input
                    id="ticket-reason"
                    type="text"
                    placeholder="티켓 지급 사유를 입력하세요"
                    value={ticketReason}
                    onChange={(e) => setTicketReason(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowTicketModal(false);
                      setTargetUser(null);
                    }}
                  >
                    취소
                  </Button>
                  <Button type="submit" disabled={isGivingTicket || !ticketReason.trim() || ticketCount <= 0}>
                    {isGivingTicket ? '지급 중...' : '티켓 지급'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';

import { useGift } from '~/features/gift/hooks/use-gift';
import { useRaffle } from '~/features/gift/hooks/use-raffle';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';

export function DrawManager() {
  const { gifts, error: giftError } = useGift();
  const [selectedGiftId, setSelectedGiftId] = useState<string>('');
  const [raffleCount, setRaffleCount] = useState<string>('1');
  const [includeAdmin, setIncludeAdmin] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showDrawingText, setShowDrawingText] = useState<boolean>(false);

  const {
    results,
    excludeDrawIds,
    error: raffleError,
    executeRaffle,
    resetRaffle,
    totalWinners,
    hasResults,
  } = useRaffle(selectedGiftId || undefined);

  const selectedGift = gifts.find((gift) => gift.id === selectedGiftId);

  // 카운트다운 애니메이션 함수
  const startCountdownAnimation = async (): Promise<void> => {
    setIsAnimating(true);

    // 3, 2, 1 카운트다운
    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      setShowDrawingText(false);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // "추첨 중..." 텍스트 표시
    setCountdown(null);
    setShowDrawingText(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };

  const handleGiftChange = (giftId: string) => {
    if (giftId !== selectedGiftId && hasResults) {
      resetRaffle();
    }
    setSelectedGiftId(giftId);

    // 경품 이름에서 인원 수 추출하여 자동 설정
    if (giftId) {
      const selectedGiftData = gifts.find((gift) => gift.id === giftId);
      if (selectedGiftData) {
        const match = selectedGiftData.name.match(/\((\d+)명\)$/);
        if (match) {
          setRaffleCount(match[1]);
        }
      }
    }
  };

  const handleRaffle = async () => {
    if (!selectedGiftId) {
      alert('경품을 선택해주세요.');
      return;
    }

    const count = Number(raffleCount);
    if (count <= 0) {
      alert('추첨 수는 1 이상이어야 합니다.');
      return;
    }

    try {
      // 카운트다운 애니메이션 실행
      await startCountdownAnimation();

      // 실제 추첨 실행
      await executeRaffle({
        raffleCount: count,
        includeAdmin,
      });
    } catch {
      // 에러 발생 시에도 오버레이 제거
    } finally {
      // 애니메이션 종료
      setIsAnimating(false);
      setCountdown(null);
      setShowDrawingText(false);
    }
  };

  const handleRaffleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 0)) {
      setRaffleCount(value);
    }
  };

  const handleReset = () => {
    if (window.confirm('추첨 결과를 모두 초기화하시겠습니까?')) {
      resetRaffle();
    }
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return phoneNumber;
    return phoneNumber.replace(/(\d{3})-(\d{4})-(\d{4})/, '$1-****-$3');
  };

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-[220px] flex-1">
              <Label htmlFor="gift-select" className="text-sm text-muted-foreground">
                경품 선택
              </Label>
              <select
                id="gift-select"
                value={selectedGiftId}
                onChange={(e) => handleGiftChange(e.target.value)}
                className="mt-1 w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none ring-offset-background transition focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 disabled:opacity-50"
                aria-label="경품 선택"
              >
                <option value="">경품을 선택하세요</option>
                {gifts.map((gift) => (
                  <option key={gift.id} value={gift.id}>
                    {gift.alias} — 응모 {gift.drawCount}개
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(giftError || raffleError) && (
            <div className="mt-2 rounded-lg border bg-destructive/5 p-3 text-destructive">
              <p className="text-sm">{giftError?.message || raffleError?.message}</p>
            </div>
          )}
        </div>
      </Card>

      {selectedGift && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-semibold">경품 정보</h2>
            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2 items-stretch">
              <div className="flex justify-center md:justify-start">
                <img
                  src={selectedGift.imageUrl}
                  alt={selectedGift.alias}
                  className="w-full max-w-60 aspect-square rounded-xl border object-cover shadow-sm md:h-full md:max-w-none md:object-contain"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-gift.png';
                  }}
                />
              </div>

              <div className="grid grid-rows-[auto,1fr] gap-4">
                <div className="text-center md:text-left space-y-1">
                  <h3 className="text-base font-medium text-foreground">{selectedGift.alias}</h3>
                  <p className="text-xs text-muted-foreground">{selectedGift.name.match(/\(\d+명\)$/)?.[0] || ''}</p>
                </div>

                <div className="row-start-2 h-full">
                  <div className="h-full rounded-xl border bg-muted/30 p-4">
                    <StatRow label="총 응모 수" value={`${selectedGift.drawCount}개`} />
                    {excludeDrawIds.length > 0 && <StatRow label="추첨된 응모" value={`${excludeDrawIds.length}개`} />}
                    <div className="my-3 h-px bg-border" />
                    <StatRow
                      label="추첨 가능한 응모"
                      value={`${Math.max(0, selectedGift.drawCount - excludeDrawIds.length)}개`}
                      valueClass="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <section className="mt-6 space-y-3">
              <h4 className="text-sm font-medium tracking-tight">추첨 설정</h4>

              <div>
                <Label htmlFor="raffle-count" className="text-sm text-muted-foreground">
                  추첨 수
                </Label>
                <Input
                  id="raffle-count"
                  type="text"
                  inputMode="numeric"
                  value={raffleCount}
                  onChange={handleRaffleCountChange}
                  placeholder="추첨할 인원 수"
                  className="mt-1"
                  aria-describedby="raffle-count-desc"
                />
                <p id="raffle-count-desc" className="mt-1 text-xs text-muted-foreground">
                  1 이상의 정수를 입력하세요.
                </p>
              </div>

              <label htmlFor="include-admin" className="flex select-none items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  id="include-admin"
                  checked={includeAdmin}
                  onChange={(e) => setIncludeAdmin(e.target.checked)}
                  className="h-4 w-4 rounded border-muted-foreground/40 text-primary focus:ring-2 focus:ring-primary/30"
                />
                <span className="text-foreground">운영자 계정 포함</span>
              </label>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={() => {
                    handleRaffle().catch(() => {});
                  }}
                  disabled={!selectedGiftId || Number(raffleCount) <= 0 || isAnimating}
                  className="flex-1"
                >
                  {isAnimating ? '추첨 중...' : hasResults ? '다시 추첨' : '추첨 시작'}
                </Button>

                {hasResults && (
                  <Button onClick={handleReset} variant="outline" className="min-w-[88px]">
                    초기화
                  </Button>
                )}
              </div>
            </section>
          </Card>

          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-semibold">당첨자 목록</h3>
              {hasResults && (
                <span className="text-xs rounded-full border bg-muted/40 px-2 py-1 text-muted-foreground">
                  총 {totalWinners}명 당첨
                </span>
              )}
            </div>

            {!hasResults ? (
              <EmptyState />
            ) : (
              <>
                <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                  {results.map((result, index) => (
                    <WinnerRow
                      key={result.drawId}
                      order={index + 1}
                      username={result.username}
                      phoneMasked={formatPhoneNumber(result.phoneNumber)}
                      university={result.university}
                      drawId={result.drawId}
                      userId={result.userId}
                    />
                  ))}
                </div>

                {excludeDrawIds.length > 0 && (
                  <div className="mt-4 rounded-lg border border-blue-200/70 bg-blue-50 p-3 text-blue-800 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-200">
                    <p className="text-xs sm:text-sm">
                      💡 다음 추첨 시 이미 당첨된 {excludeDrawIds.length}개 응모는 자동으로 제외됩니다.
                    </p>
                  </div>
                )}
              </>
            )}
          </Card>
        </div>
      )}

      {/* 추첨 애니메이션 오버레이 */}
      {isAnimating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center">
            {showDrawingText ? (
              <div className="animate-pulse">
                <h2 className="text-4xl font-bold text-white mb-2">🎁</h2>
                <p className="text-2xl font-semibold text-white">추첨 중...</p>
              </div>
            ) : countdown !== null ? (
              <div className="animate-bounce">
                <span className="text-6xl font-bold text-white">{countdown}</span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value, valueClass }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClass ? `font-medium ${valueClass}` : 'font-medium'}>{value}</span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
      <div className="mb-4 text-4xl">🎁</div>
      <p className="text-sm">아직 추첨 결과가 없습니다</p>
      <p className="text-xs">추첨을 시작해주세요</p>
    </div>
  );
}

function WinnerRow({
  username,
  phoneMasked,
  university,
  drawId,
  userId,
}: {
  order: number;
  username: string;
  phoneMasked: string;
  university?: string;
  drawId: string;
  userId: string;
}) {
  return (
    <div className="group rounded-lg border bg-card p-3 transition hover:shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-foreground">{username}</p>
          <p className="text-xs text-muted-foreground">{phoneMasked}</p>
          {university && <p className="text-xs text-muted-foreground">{university}</p>}
        </div>
        <div className="text-right">
          <p className="text-[11px] leading-5 text-muted-foreground/90">응모 ID: {drawId}</p>
          <p className="text-[11px] leading-5 text-muted-foreground/90">사용자 ID: {userId}</p>
        </div>
      </div>
    </div>
  );
}

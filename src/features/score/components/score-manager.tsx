import { useState } from 'react';

import { useScore } from '~/features/score/hooks/use-score';
import { MatchStatus } from '~/features/score/types/match-status';
import { emojiMap, Sport } from '~/shared/types/sport';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';
import { Input } from '~/shared/ui/input';

const sports = Object.values(Sport);

export function ScoreManager() {
  const [selectedSport, setSelectedSport] = useState<Sport>(Sport.FOOTBALL);
  const { scores, error, handleStart, handleEnd, handleReset, handleUpdate } = useScore();

  const score = scores[selectedSport];

  const matchStatus = score?.matchStatus;

  const [ku, setKu] = useState('0');
  const [yu, setYu] = useState('0');

  const handleStartClick = () => {
    handleStart(selectedSport);
  };

  const handleEndClick = () => {
    handleEnd(selectedSport);
  };

  const handleResetClick = () => {
    setKu('0');
    setYu('0');
    handleReset(selectedSport);
  };

  const handleUpdateClick = () => {
    handleUpdate(selectedSport, Number(ku), Number(yu));
  };

  const handleKuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 빈 문자열이거나 0 이상의 정수만 허용
    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 0)) {
      setKu(value);
    }
  };

  const handleYuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 빈 문자열이거나 0 이상의 정수만 허용
    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 0)) {
      setYu(value);
    }
  };

  return (
    <div className="space-y-4 mx-auto px-4">
      {/* 탭 */}
      <div className="flex border-b border-border">
        {sports.map((sport) => (
          <button
            key={sport}
            onClick={() => setSelectedSport(sport)}
            className={`flex-1 text-center py-2 px-4 font-semibold transition-all border-b-2 ${
              selectedSport === sport
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {sport}
          </button>
        ))}
      </div>

      {/* 점수 카드 */}
      <Card className="space-y-6 p-6">
        <div className="flex justify-between items-start">
          <h2 className="text-xl font-bold">
            {emojiMap[selectedSport]} {selectedSport} 경기 관리
          </h2>
          {score && (
            <span className="text-sm text-muted">
              🕒 상태: <b>{score.matchStatus}</b>
            </span>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">⚠️ 에러가 발생했습니다: {error.message}</p>}
        {!score ? (
          <p className="text-sm text-muted">⏳ 점수 불러오는 중...</p>
        ) : (
          <>
            {/* 점수 표시 */}
            <div className="flex justify-center items-center gap-8 text-3xl font-bold">
              <div className="text-red-600">고대 {score.KUScore}</div>
              <span className="text-2xl text-muted-foreground">:</span>
              <div className="text-blue-500"> 연대 {score.YUScore}</div>
            </div>

            {/* 조작 버튼 */}
            <div className="flex flex-wrap justify-center gap-3">
              <Button onClick={handleStartClick} disabled={matchStatus !== MatchStatus.NOT_STARTED}>
                ▶️ 경기 시작
              </Button>
              <Button onClick={handleEndClick} disabled={matchStatus !== MatchStatus.IN_PROGRESS} variant="destructive">
                ⏹ 경기 종료
              </Button>
              <Button onClick={handleResetClick} disabled={matchStatus !== MatchStatus.COMPLETED} variant="secondary">
                ♻️ 초기화
              </Button>
            </div>

            {/* 점수 수정 */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 items-center mt-4">
              <div className="flex gap-2 items-center">
                <Input
                  type="text"
                  inputMode="numeric"
                  disabled={matchStatus !== MatchStatus.IN_PROGRESS}
                  value={ku}
                  onChange={handleKuChange}
                  className="w-24 text-center"
                  placeholder="KU 점수"
                />
                <Input
                  type="text"
                  inputMode="numeric"
                  disabled={matchStatus !== MatchStatus.IN_PROGRESS}
                  value={yu}
                  onChange={handleYuChange}
                  className="w-24 text-center"
                  placeholder="YU 점수"
                />
              </div>
              <Button onClick={handleUpdateClick} disabled={matchStatus !== MatchStatus.IN_PROGRESS}>
                ✏️ 점수 수정
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

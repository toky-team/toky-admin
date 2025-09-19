import { useState } from 'react';

import { usePlayer } from '~/features/player/hooks/use-player';
import { useQuestion } from '~/features/question/hooks/use-question';
import { MatchResult } from '~/shared/types/match-result';
import { emojiMap, Sport } from '~/shared/types/sport';
import { University } from '~/shared/types/university';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';

const sports = Object.values(Sport);

export function QuestionManager() {
  const [selectedSport, setSelectedSport] = useState<Sport>(Sport.FOOTBALL);
  const { questions, error, handleUpdate, handleSetAnswer } = useQuestion();
  const { players } = usePlayer();

  const selectedQuestion = questions[selectedSport];

  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string>('');
  const [editingPositionFilter, setEditingPositionFilter] = useState<string>('');

  // 정답 관련 상태
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [answerForm, setAnswerForm] = useState<{
    matchResult: MatchResult;
    kuScore: string;
    yuScore: string;
    kuPlayer: string[];
    yuPlayer: string[];
  }>({
    matchResult: MatchResult.KOREA_UNIVERSITY,
    kuScore: '0',
    yuScore: '0',
    kuPlayer: [],
    yuPlayer: [],
  });

  const handleEditStart = () => {
    if (selectedQuestion) {
      setEditingQuestion(selectedQuestion.question);
      setEditingPositionFilter(selectedQuestion.positionFilter || '');
    } else {
      setEditingQuestion('');
      setEditingPositionFilter('');
    }
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditingQuestion('');
    setEditingPositionFilter('');
  };

  const handleEditSave = async () => {
    if (editingQuestion.trim() === '') {
      alert('질문을 입력해주세요.');
      return;
    }

    const positionFilter = editingPositionFilter.trim() === '' ? null : editingPositionFilter.trim();

    await handleUpdate(selectedSport, editingQuestion, positionFilter);
    handleEditCancel();
  };

  // 정답 관련 핸들러들
  const handleAnswerEditStart = () => {
    const currentAnswer = selectedQuestion?.answer;
    if (currentAnswer) {
      setAnswerForm({
        matchResult: currentAnswer.predict.matchResult,
        kuScore: currentAnswer.predict.score.kuScore.toString(),
        yuScore: currentAnswer.predict.score.yuScore.toString(),
        kuPlayer: currentAnswer.kuPlayer.playerId,
        yuPlayer: currentAnswer.yuPlayer.playerId,
      });
    } else {
      setAnswerForm({
        matchResult: MatchResult.KOREA_UNIVERSITY,
        kuScore: '0',
        yuScore: '0',
        kuPlayer: [],
        yuPlayer: [],
      });
    }
    setIsEditingAnswer(true);
  };

  const handleAnswerEditCancel = () => {
    setIsEditingAnswer(false);
  };

  const handleAnswerSave = async () => {
    const kuScoreNum = Number(answerForm.kuScore);
    const yuScoreNum = Number(answerForm.yuScore);

    // 경기 결과와 점수 정합성 검사
    const isValidScore = () => {
      switch (answerForm.matchResult) {
        case MatchResult.KOREA_UNIVERSITY:
          return kuScoreNum > yuScoreNum;
        case MatchResult.YONSEI_UNIVERSITY:
          return yuScoreNum > kuScoreNum;
        case MatchResult.DRAW:
          return kuScoreNum === yuScoreNum;
        default:
          return false;
      }
    };

    if (!isValidScore()) {
      const expectedResult =
        kuScoreNum > yuScoreNum ? '고려대학교 승리' : yuScoreNum > kuScoreNum ? '연세대학교 승리' : '무승부';

      alert(
        `점수와 경기 결과가 일치하지 않습니다.\n현재 점수(${kuScoreNum}:${yuScoreNum})로는 "${expectedResult}"가 되어야 합니다.`
      );
      return;
    }

    const answer = {
      predict: {
        matchResult: answerForm.matchResult,
        score: {
          kuScore: kuScoreNum,
          yuScore: yuScoreNum,
        },
      },
      kuPlayer: {
        playerId: answerForm.kuPlayer,
      },
      yuPlayer: {
        playerId: answerForm.yuPlayer,
      },
    };

    await handleSetAnswer(selectedSport, answer);
    setIsEditingAnswer(false);
  };

  const handleAnswerDelete = async () => {
    if (confirm('정답을 삭제하시겠습니까?\n\n⚠️ 주의: 이미 지급된 응모권은 회수할 수 없습니다.')) {
      await handleSetAnswer(selectedSport, null);
    }
  };

  // 선수 추가/제거 핸들러
  const handleAddPlayer = (university: 'ku' | 'yu', playerId: string) => {
    const field = university === 'ku' ? 'kuPlayer' : 'yuPlayer';
    setAnswerForm((prev) => ({
      ...prev,
      [field]: [...prev[field], playerId],
    }));
  };

  const handleRemovePlayer = (university: 'ku' | 'yu', index: number) => {
    const field = university === 'ku' ? 'kuPlayer' : 'yuPlayer';
    setAnswerForm((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  // 점수 유효성 검사 및 핸들러
  const handleKuScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 빈 문자열이거나 0 이상의 정수만 허용
    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 0)) {
      setAnswerForm((prev) => ({ ...prev, kuScore: value }));
    }
  };

  const handleYuScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 빈 문자열이거나 0 이상의 정수만 허용
    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 0)) {
      setAnswerForm((prev) => ({ ...prev, yuScore: value }));
    }
  };

  // 실시간 정합성 검사
  const getValidationStatus = () => {
    const kuScoreNum = Number(answerForm.kuScore);
    const yuScoreNum = Number(answerForm.yuScore);

    switch (answerForm.matchResult) {
      case MatchResult.KOREA_UNIVERSITY:
        return {
          isValid: kuScoreNum > yuScoreNum,
          message: kuScoreNum <= yuScoreNum ? '고려대 승리 시 고려대 점수가 더 높아야 합니다.' : '',
        };
      case MatchResult.YONSEI_UNIVERSITY:
        return {
          isValid: yuScoreNum > kuScoreNum,
          message: yuScoreNum <= kuScoreNum ? '연세대 승리 시 연세대 점수가 더 높아야 합니다.' : '',
        };
      case MatchResult.DRAW:
        return {
          isValid: kuScoreNum === yuScoreNum,
          message: kuScoreNum !== yuScoreNum ? '무승부 시 양팀 점수가 같아야 합니다.' : '',
        };
      default:
        return { isValid: true, message: '' };
    }
  };

  return (
    <div className="space-y-4 mx-auto px-4">
      {/* 탭 */}
      <div className="flex border-b border-border">
        {sports.map((sport) => (
          <button
            key={sport}
            onClick={() => {
              setSelectedSport(sport);
              handleEditCancel();
            }}
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

      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {emojiMap[selectedSport]} {selectedSport} 베팅 문항 관리
        </h2>
        <Button onClick={handleEditStart} disabled={isEditing}>
          {selectedQuestion ? '✏️ 수정' : '➕ 질문 추가'}
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-500 text-sm">⚠️ 에러가 발생했습니다: {error.message}</p>
        </Card>
      )}

      {/* 질문 관리 */}
      {isEditing ? (
        /* 편집 모드 */
        <Card className="p-8">
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{selectedQuestion ? '질문 수정' : '새 질문 추가'}</h3>
              <div className="flex gap-2">
                <Button onClick={() => void handleEditSave()}>💾 저장</Button>
                <Button onClick={handleEditCancel} variant="secondary">
                  ❌ 취소
                </Button>
              </div>
            </div>

            {/* 질문 입력 */}
            <div>
              <Label htmlFor="question">질문 *</Label>
              <textarea
                id="question"
                value={editingQuestion}
                onChange={(e) => setEditingQuestion(e.target.value)}
                placeholder="베팅 질문을 입력하세요"
                className="mt-2 w-full px-3 py-3 border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-base"
                rows={3}
              />
            </div>

            {/* 포지션 필터 입력 */}
            <div>
              <Label htmlFor="positionFilter">포지션 필터</Label>
              <Input
                id="positionFilter"
                value={editingPositionFilter}
                onChange={(e) => setEditingPositionFilter(e.target.value)}
                placeholder="특정 포지션만 대상으로 할 경우 입력 (예: 공격수, 수비수 등)"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-2">비워두면 모든 선수를 대상으로 합니다.</p>
            </div>
          </div>
        </Card>
      ) : (
        /* 보기 모드 */
        <>
          {!selectedQuestion ? (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">등록된 질문이 없습니다.</p>
              <p className="text-sm text-muted-foreground mt-1">
                상단의 &quot;질문 추가&quot; 버튼을 클릭하여 질문을 등록하세요.
              </p>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="space-y-4">
                {/* 질문 내용 */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">베팅 질문</span>
                    {selectedQuestion.positionFilter && (
                      <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded">
                        📍 {selectedQuestion.positionFilter}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold">{selectedQuestion.question}</h3>
                </div>

                {/* 필터 정보 */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-sm text-muted-foreground">
                    <strong>대상 선수:</strong>{' '}
                    {selectedQuestion.positionFilter ? `${selectedQuestion.positionFilter} 포지션` : '모든 선수'}
                  </div>
                </div>

                {/* 정답 정보 */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold">정답 정보</h4>
                    <div className="flex gap-2">
                      {selectedQuestion.answer ? (
                        <>
                          <Button onClick={() => void handleAnswerDelete()} variant="destructive" size="sm">
                            🗑️ 정답 삭제
                          </Button>
                        </>
                      ) : (
                        <Button onClick={handleAnswerEditStart} size="sm">
                          ➕ 정답 등록
                        </Button>
                      )}
                    </div>
                  </div>

                  {selectedQuestion.answer ? (
                    <div className="bg-primary/10 border border-gray-200 rounded-md p-4">
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>경기 결과:</strong> {selectedQuestion.answer.predict.matchResult}
                        </div>
                        <div>
                          <strong>점수:</strong> 고려대 {selectedQuestion.answer.predict.score.kuScore} -{' '}
                          {selectedQuestion.answer.predict.score.yuScore} 연세대
                        </div>
                        {selectedQuestion.answer.kuPlayer.playerId.length > 0 &&
                          (() => {
                            const kuPlayers = selectedQuestion.answer.kuPlayer.playerId
                              .map((playerId) => {
                                const player = players[selectedSport]?.[University.KOREA_UNIVERSITY]?.find(
                                  (p) => p.id === playerId
                                );
                                return player
                                  ? `${player.name}(#${player.backNumber}) - ${player.position}`
                                  : `ID: ${playerId}`;
                              })
                              .join(', ');
                            return (
                              <div>
                                <strong>고려대 선수:</strong> {kuPlayers}
                              </div>
                            );
                          })()}
                        {selectedQuestion.answer.yuPlayer.playerId.length > 0 &&
                          (() => {
                            const yuPlayers = selectedQuestion.answer.yuPlayer.playerId
                              .map((playerId) => {
                                const player = players[selectedSport]?.[University.YONSEI_UNIVERSITY]?.find(
                                  (p) => p.id === playerId
                                );
                                return player
                                  ? `${player.name}(#${player.backNumber}) - ${player.position}`
                                  : `ID: ${playerId}`;
                              })
                              .join(', ');
                            return (
                              <div>
                                <strong>연세대 선수:</strong> {yuPlayers}
                              </div>
                            );
                          })()}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-500 border border-gray-200 rounded-md p-4 text-center text-muted-foreground">
                      정답이 아직 등록되지 않았습니다.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* 정답 편집 모드 */}
      {isEditingAnswer && selectedQuestion && (
        <Card className="p-6 mt-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold">{selectedQuestion.answer ? '정답 수정' : '정답 등록'}</h4>
              <div className="flex gap-2">
                <Button onClick={() => void handleAnswerSave()} size="sm" disabled={!getValidationStatus().isValid}>
                  💾 저장
                </Button>
                <Button onClick={handleAnswerEditCancel} variant="secondary" size="sm">
                  ❌ 취소
                </Button>
              </div>
            </div>

            {/* 경기 결과 선택 */}
            <div className="flex justify-center">
              <div className="w-full max-w-xs">
                <Label htmlFor="matchResult" className="block text-center mb-2">
                  경기 결과 *
                </Label>
                <select
                  id="matchResult"
                  value={answerForm.matchResult}
                  onChange={(e) => setAnswerForm((prev) => ({ ...prev, matchResult: e.target.value as MatchResult }))}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                >
                  <option value={MatchResult.KOREA_UNIVERSITY}>{MatchResult.KOREA_UNIVERSITY}</option>
                  <option value={MatchResult.YONSEI_UNIVERSITY}>{MatchResult.YONSEI_UNIVERSITY}</option>
                  <option value={MatchResult.DRAW}>{MatchResult.DRAW}</option>
                </select>
              </div>
            </div>

            {/* 점수 입력 */}
            <div className="flex justify-center">
              <div className="flex gap-4 items-center">
                <div className="text-center">
                  <Label htmlFor="kuScore" className="block mb-2">
                    고려대 점수 *
                  </Label>
                  <Input
                    id="kuScore"
                    type="text"
                    inputMode="numeric"
                    value={answerForm.kuScore}
                    onChange={handleKuScoreChange}
                    className="w-24 text-center"
                    placeholder="0"
                  />
                </div>
                <span className="text-2xl text-muted-foreground mt-6">:</span>
                <div className="text-center">
                  <Label htmlFor="yuScore" className="block mb-2">
                    연세대 점수 *
                  </Label>
                  <Input
                    id="yuScore"
                    type="text"
                    inputMode="numeric"
                    value={answerForm.yuScore}
                    onChange={handleYuScoreChange}
                    className="w-24 text-center"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* 유효성 검사 메시지 */}
            {(() => {
              const validation = getValidationStatus();
              if (!validation.isValid && validation.message) {
                return (
                  <div className="flex justify-center">
                    <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
                      <p className="text-red-600 text-sm">⚠️ {validation.message}</p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            {/* 선수 선택 */}
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              {/* 고려대 선수 선택 */}
              <div className="flex-1 max-w-md">
                <Label className="block text-center mb-2">고려대 선수 (선택사항)</Label>

                {/* 선택된 선수 목록 */}
                {answerForm.kuPlayer.length > 0 && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <div className="text-sm font-medium text-red-700 mb-2">선택된 선수:</div>
                    <div className="space-y-1">
                      {answerForm.kuPlayer.map((playerId, index) => {
                        const player = players[selectedSport]?.[University.KOREA_UNIVERSITY]?.find(
                          (p) => p.id === playerId
                        );
                        return (
                          <div
                            key={playerId}
                            className="flex items-center justify-between bg-gray-500 border border-gray-200 p-2 rounded text-sm"
                          >
                            <span>
                              {player
                                ? `${player.name} (#${player.backNumber}) - ${player.position}`
                                : `ID: ${playerId}`}
                            </span>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemovePlayer('ku', index)}
                              className="ml-2 px-2 py-1 text-xs"
                            >
                              ✕
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 선수 추가 */}
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !answerForm.kuPlayer.includes(e.target.value)) {
                      handleAddPlayer('ku', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                >
                  <option value="">선수 추가하기</option>
                  {players[selectedSport]?.[University.KOREA_UNIVERSITY]
                    ?.filter((player) => !answerForm.kuPlayer.includes(player.id))
                    .map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name} (#{player.backNumber}) - {player.position}
                      </option>
                    ))}
                </select>
              </div>

              {/* 연세대 선수 선택 */}
              <div className="flex-1 max-w-md">
                <Label className="block text-center mb-2">연세대 선수 (선택사항)</Label>

                {/* 선택된 선수 목록 */}
                {answerForm.yuPlayer.length > 0 && (
                  <div className="mb-3 p-3 bg-blue-500 border border-blue-200 rounded-md">
                    <div className="text-sm font-medium text-blue-700 mb-2">선택된 선수:</div>
                    <div className="space-y-1">
                      {answerForm.yuPlayer.map((playerId, index) => {
                        const player = players[selectedSport]?.[University.YONSEI_UNIVERSITY]?.find(
                          (p) => p.id === playerId
                        );
                        return (
                          <div
                            key={playerId}
                            className="flex items-center justify-between bg-grey-100 p-2 rounded text-sm"
                          >
                            <span>
                              {player
                                ? `${player.name} (#${player.backNumber}) - ${player.position}`
                                : `ID: ${playerId}`}
                            </span>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemovePlayer('yu', index)}
                              className="ml-2 px-2 py-1 text-xs"
                            >
                              ✕
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 선수 추가 */}
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !answerForm.yuPlayer.includes(e.target.value)) {
                      handleAddPlayer('yu', e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                >
                  <option value="">선수 추가하기</option>
                  {players[selectedSport]?.[University.YONSEI_UNIVERSITY]
                    ?.filter((player) => !answerForm.yuPlayer.includes(player.id))
                    .map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name} (#{player.backNumber}) - {player.position}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

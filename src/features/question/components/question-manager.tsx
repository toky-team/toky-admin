import { useState } from 'react';

import { useQuestion } from '~/features/question/hooks/use-question';
import { emojiMap, Sport } from '~/shared/types/sport';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';

const sports = Object.values(Sport);

export function QuestionManager() {
  const [selectedSport, setSelectedSport] = useState<Sport>(Sport.FOOTBALL);
  const { questions, error, handleUpdate } = useQuestion();

  const selectedQuestion = questions[selectedSport];

  const [isEditing, setIsEditing] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string>('');
  const [editingPositionFilter, setEditingPositionFilter] = useState<string>('');

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
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

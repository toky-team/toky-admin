import { useState } from 'react';

import { useQuestion } from '~/features/question/hooks/use-question';
import type { Question } from '~/features/question/types/question';
import { emojiMap, Sport } from '~/shared/types/sport';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';

const sports = Object.values(Sport);

export function QuestionManager() {
  const [selectedSport, setSelectedSport] = useState<Sport>(Sport.FOOTBALL);
  const { questions, error, handleUpdate } = useQuestion();

  const selectedQuestions = questions[selectedSport];

  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<string>('');
  const [editingOptions, setEditingOptions] = useState<string[]>([]);

  const handleEditStart = (question: Question) => {
    setEditingQuestionId(question.id);
    setEditingQuestion(question.question);
    setEditingOptions([...question.options]);
  };

  const handleEditCancel = () => {
    setEditingQuestionId(null);
    setEditingQuestion('');
    setEditingOptions([]);
  };

  const handleEditSave = async () => {
    if (!editingQuestionId) return;

    const filteredOptions = editingOptions.filter((option) => option.trim() !== '');

    if (editingQuestion.trim() === '' || filteredOptions.length < 2 || filteredOptions.length > 3) {
      alert('질문과 최소 2-3개의 선택지를 입력해주세요.');
      return;
    }

    await handleUpdate(editingQuestionId, editingQuestion, filteredOptions);
    handleEditCancel();
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...editingOptions];
    newOptions[index] = value;
    setEditingOptions(newOptions);
  };

  const handleAddOption = () => {
    if (editingOptions.length < 3) {
      setEditingOptions([...editingOptions, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (editingOptions.length > 2) {
      const newOptions = editingOptions.filter((_, i) => i !== index);
      setEditingOptions(newOptions);
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
        <span className="text-sm text-muted-foreground">총 {selectedQuestions?.length || 0}개 문항</span>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-500 text-sm">⚠️ 에러가 발생했습니다</p>
        </Card>
      )}

      {/* 질문 목록 */}
      {!selectedQuestions || selectedQuestions.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">질문이 없습니다.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {selectedQuestions
            .sort((a, b) => a.order - b.order)
            .map((question) => (
              <Card key={question.id} className="p-6">
                {editingQuestionId === question.id ? (
                  /* 편집 모드 */
                  <div className="space-y-4">
                    {/* 편집 헤더 */}
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">질문 {question.order} 편집</h3>
                      <div className="flex gap-2">
                        <Button onClick={() => void handleEditSave()}>💾 저장</Button>
                        <Button onClick={handleEditCancel} variant="secondary">
                          ❌ 취소
                        </Button>
                      </div>
                    </div>

                    {/* 질문 입력 */}
                    <div>
                      <Label htmlFor={`question-${question.id}`}>질문</Label>
                      <Input
                        id={`question-${question.id}`}
                        value={editingQuestion}
                        onChange={(e) => setEditingQuestion(e.target.value)}
                        placeholder="질문을 입력하세요"
                        className="mt-1"
                      />
                    </div>

                    {/* 선택지 입력 */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <Label>선택지</Label>
                        <Button onClick={handleAddOption} variant="secondary" disabled={editingOptions.length >= 3}>
                          ➕ 선택지 추가
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {editingOptions.map((option, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={option}
                              onChange={(e) => handleOptionChange(index, e.target.value)}
                              placeholder={`선택지 ${index + 1}`}
                              className="flex-1"
                            />
                            <Button
                              onClick={() => handleRemoveOption(index)}
                              variant="destructive"
                              disabled={editingOptions.length <= 2}
                            >
                              🗑️
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 보기 모드 */
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        {/* 질문 헤더 */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                            질문 {question.order}
                          </span>
                          <span className="text-xs text-muted-foreground">{question.options.length}개 선택지</span>
                        </div>

                        {/* 질문 내용 */}
                        <h3 className="text-lg font-semibold mb-3">{question.question}</h3>

                        {/* 선택지 목록 */}
                        <div className="space-y-1">
                          {question.options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              {option}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 수정 버튼 */}
                      <Button
                        onClick={() => handleEditStart(question)}
                        variant="secondary"
                        disabled={editingQuestionId !== null}
                      >
                        ✏️ 수정
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}

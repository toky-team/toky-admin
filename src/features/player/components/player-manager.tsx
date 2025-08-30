import { useState } from 'react';

import { usePlayer } from '~/features/player/hooks/use-player';
import type { Player } from '~/features/player/types/player';
import { emojiMap, Sport } from '~/shared/types/sport';
import { University } from '~/shared/types/university';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';

const sports = Object.values(Sport);
const universities = Object.values(University);

export function PlayerManager() {
  const [selectedSport, setSelectedSport] = useState<Sport>(Sport.FOOTBALL);
  const { players, error, handleCreate, handleUpdate, handleDelete } = usePlayer();

  const selectedPlayers = players[selectedSport];

  const [isCreating, setIsCreating] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [expandedPlayerIds, setExpandedPlayerIds] = useState<Set<string>>(new Set());
  const [formData, setFormData] = useState<{
    name: string;
    university: University;
    sport: Sport;
    department: string;
    birth: string;
    height: string;
    weight: string;
    position: string;
    backNumber: string;
    careers: string[];
    isPrimary: boolean;
    image: File | null;
  }>({
    name: '',
    university: University.KOREA_UNIVERSITY,
    sport: selectedSport,
    department: '',
    birth: '',
    height: '',
    weight: '',
    position: '',
    backNumber: '',
    careers: [],
    isPrimary: false,
    image: null as File | null,
  });

  // Date format conversion functions
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';
    // Convert YYYY.MM.DD to YYYY-MM-DD for input
    return dateString.replace(/\./g, '-');
  };

  const formatDateForStorage = (inputDate: string): string => {
    if (!inputDate) return '';
    // Convert YYYY-MM-DD to YYYY.MM.DD for storage
    return inputDate.replace(/-/g, '.');
  };

  const handleNumberChange =
    (field: 'height' | 'weight' | 'backNumber') => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      // 빈 문자열이거나 양수만 허용
      if (value === '' || (/^\d+$/.test(value) && Number(value) > 0)) {
        setFormData((prev) => ({ ...prev, [field]: value }));
      }
    };

  const togglePlayerExpansion = (playerId: string) => {
    setExpandedPlayerIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
      } else {
        newSet.add(playerId);
      }
      return newSet;
    });
  };

  const handleCreateStart = () => {
    setIsCreating(true);
    setFormData({
      name: '',
      university: University.KOREA_UNIVERSITY,
      sport: selectedSport,
      department: '',
      birth: '',
      height: '',
      weight: '',
      position: '',
      backNumber: '',
      careers: [],
      isPrimary: false,
      image: null,
    });
  };

  const handleEditStart = (player: Player) => {
    setEditingPlayerId(player.id);
    setFormData({
      name: player.name,
      university: player.university,
      sport: player.sport,
      department: player.department,
      birth: player.birth ? formatDateForInput(player.birth) : '',
      height: player.height?.toString() ?? '',
      weight: player.weight?.toString() ?? '',
      position: player.position,
      backNumber: player.backNumber.toString(),
      careers: Array.isArray(player.careers) ? [...player.careers] : [],
      isPrimary: player.isPrimary,
      image: null,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingPlayerId(null);
    setFormData({
      name: '',
      university: University.KOREA_UNIVERSITY,
      sport: selectedSport,
      department: '',
      birth: '',
      height: '',
      weight: '',
      position: '',
      backNumber: '',
      careers: [],
      isPrimary: false,
      image: null,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.department.trim() || !formData.position.trim()) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    const backNumber = Number(formData.backNumber);

    if (backNumber <= 0) {
      alert('등번호는 0보다 큰 값이어야 합니다.');
      return;
    }

    // height, weight, birth는 nullable이므로 빈 값이면 null로 처리
    const height = formData.height ? Number(formData.height) : null;
    const weight = formData.weight ? Number(formData.weight) : null;
    const birth = formData.birth ? formatDateForStorage(formData.birth) : null;

    // height, weight가 입력된 경우 유효성 검사
    if (height !== null && height <= 0) {
      alert('키는 0보다 큰 값이어야 합니다.');
      return;
    }

    if (weight !== null && weight <= 0) {
      alert('몸무게는 0보다 큰 값이어야 합니다.');
      return;
    }

    if (isCreating) {
      if (!formData.image) {
        alert('선수 이미지를 업로드해주세요.');
        return;
      }
      await handleCreate({
        name: formData.name,
        university: formData.university,
        sport: formData.sport,
        department: formData.department,
        birth,
        height,
        weight,
        position: formData.position,
        backNumber,
        careers: formData.careers,
        isPrimary: formData.isPrimary,
        image: formData.image,
      });
    } else if (editingPlayerId) {
      await handleUpdate(editingPlayerId, {
        name: formData.name,
        university: formData.university,
        sport: formData.sport,
        department: formData.department,
        birth,
        height,
        weight,
        position: formData.position,
        backNumber,
        careers: formData.careers,
        isPrimary: formData.isPrimary,
        image: formData.image ?? undefined,
      });
    }
    handleCancel();
  };

  const handleDeletePlayer = async (playerId: string, sport: Sport, university: University) => {
    if (confirm('정말로 이 선수를 삭제하시겠습니까?')) {
      await handleDelete(playerId, sport, university);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const addCareer = () => {
    setFormData((prev) => ({ ...prev, careers: [...prev.careers, ''] }));
  };

  const removeCareer = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      careers: prev.careers.filter((_, i) => i !== index),
    }));
  };

  const updateCareer = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      careers: prev.careers.map((career, i) => (i === index ? value : career)),
    }));
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
              setFormData((prev) => ({ ...prev, sport }));
              handleCancel();
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
          {emojiMap[selectedSport]} {selectedSport} 선수 관리
        </h2>
        <Button onClick={handleCreateStart} disabled={isCreating || editingPlayerId !== null}>
          ➕ 선수 추가
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-500 text-sm">⚠️ 에러가 발생했습니다: {error.message}</p>
        </Card>
      )}

      {/* 선수 추가 폼 */}
      {isCreating && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">새 선수 추가</h3>
              <div className="flex gap-2">
                <Button onClick={() => void handleSave()}>💾 저장</Button>
                <Button onClick={handleCancel} variant="secondary">
                  ❌ 취소
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="선수 이름"
                />
              </div>
              <div>
                <Label htmlFor="university">대학 *</Label>
                <select
                  id="university"
                  value={formData.university}
                  onChange={(e) => setFormData((prev) => ({ ...prev, university: e.target.value as University }))}
                  className="w-full px-3 py-2 border border-input rounded-md"
                >
                  {universities.map((uni) => (
                    <option key={uni} value={uni}>
                      {uni}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="department">학과 *</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                  placeholder="학과 및 학번"
                />
              </div>
              <div>
                <Label htmlFor="position">포지션 *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                  placeholder="포지션"
                />
              </div>
              <div>
                <Label htmlFor="birth">생년월일</Label>
                <Input
                  id="birth"
                  type="date"
                  value={formData.birth}
                  onChange={(e) => setFormData((prev) => ({ ...prev, birth: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="backNumber">등번호 *</Label>
                <Input
                  id="backNumber"
                  type="text"
                  inputMode="numeric"
                  value={formData.backNumber}
                  onChange={handleNumberChange('backNumber')}
                  placeholder="등번호"
                  className="[&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <Label htmlFor="height">키 (cm)</Label>
                <Input
                  id="height"
                  type="text"
                  inputMode="numeric"
                  value={formData.height}
                  onChange={handleNumberChange('height')}
                  placeholder="키"
                  className="[&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <Label htmlFor="weight">몸무게 (kg)</Label>
                <Input
                  id="weight"
                  type="text"
                  inputMode="numeric"
                  value={formData.weight}
                  onChange={handleNumberChange('weight')}
                  placeholder="몸무게"
                  className="[&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <input
                    id="isPrimary"
                    type="checkbox"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData((prev) => ({ ...prev, isPrimary: e.target.checked }))}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <Label htmlFor="isPrimary">주요 선수</Label>
                </div>
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="image">선수 이미지 *</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
              </div>
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-2">
                  <Label>주요 경력</Label>
                  <Button type="button" onClick={addCareer} variant="secondary" size="sm">
                    ➕ 경력 추가
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.careers.map((career, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={career}
                        onChange={(e) => updateCareer(index, e.target.value)}
                        placeholder="경력사항을 입력하세요"
                        className="flex-1"
                      />
                      <Button type="button" onClick={() => removeCareer(index)} variant="destructive" size="sm">
                        🗑️
                      </Button>
                    </div>
                  ))}
                  {formData.careers.length === 0 && (
                    <p className="text-muted-foreground text-sm">등록된 경력이 없습니다.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 선수 목록 */}
      <div className="space-y-6">
        {universities.map((university) => {
          const universityPlayers = selectedPlayers?.[university] || [];

          return (
            <Card key={university} className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {university} ({universityPlayers.length}명)
              </h3>

              {universityPlayers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">등록된 선수가 없습니다.</p>
              ) : (
                <div className="space-y-3">
                  {universityPlayers
                    .sort((a, b) => a.backNumber - b.backNumber)
                    .map((player) => (
                      <Card key={player.id} className="p-4">
                        {editingPlayerId === player.id ? (
                          /* 편집 모드 */
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <h4 className="font-semibold">선수 정보 수정</h4>
                              <div className="flex gap-1">
                                <Button onClick={() => void handleSave()}>💾</Button>
                                <Button onClick={handleCancel} variant="secondary">
                                  ❌
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-name">이름 *</Label>
                                <Input
                                  id="edit-name"
                                  value={formData.name}
                                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                                  placeholder="이름"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-department">학과 *</Label>
                                <Input
                                  id="edit-department"
                                  value={formData.department}
                                  onChange={(e) => setFormData((prev) => ({ ...prev, department: e.target.value }))}
                                  placeholder="학과"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-position">포지션 *</Label>
                                <Input
                                  id="edit-position"
                                  value={formData.position}
                                  onChange={(e) => setFormData((prev) => ({ ...prev, position: e.target.value }))}
                                  placeholder="포지션"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-birth">생년월일</Label>
                                <Input
                                  id="edit-birth"
                                  type="date"
                                  value={formData.birth}
                                  onChange={(e) => setFormData((prev) => ({ ...prev, birth: e.target.value }))}
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-backNumber">등번호 *</Label>
                                <Input
                                  id="edit-backNumber"
                                  type="text"
                                  inputMode="numeric"
                                  value={formData.backNumber}
                                  onChange={handleNumberChange('backNumber')}
                                  placeholder="등번호"
                                  className="text-sm [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-height">키 (cm)</Label>
                                <Input
                                  id="edit-height"
                                  type="text"
                                  inputMode="numeric"
                                  value={formData.height}
                                  onChange={handleNumberChange('height')}
                                  placeholder="키"
                                  className="text-sm [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-weight">몸무게 (kg)</Label>
                                <Input
                                  id="edit-weight"
                                  type="text"
                                  inputMode="numeric"
                                  value={formData.weight}
                                  onChange={handleNumberChange('weight')}
                                  placeholder="몸무게"
                                  className="text-sm [&::-webkit-inner-spin-button]:appearance-none"
                                />
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    id="edit-isPrimary"
                                    type="checkbox"
                                    checked={formData.isPrimary}
                                    onChange={(e) => setFormData((prev) => ({ ...prev, isPrimary: e.target.checked }))}
                                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                  />
                                  <Label htmlFor="edit-isPrimary">주요 선수</Label>
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <Label htmlFor="edit-image">선수 이미지</Label>
                                <Input
                                  id="edit-image"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="text-sm w-full"
                                />
                              </div>
                              <div className="md:col-span-2">
                                <div className="flex justify-between items-center mb-2">
                                  <Label>주요 경력</Label>
                                  <Button type="button" onClick={addCareer} variant="secondary" size="sm">
                                    ➕ 경력 추가
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {formData.careers.map((career, index) => (
                                    <div key={index} className="flex gap-2">
                                      <Input
                                        value={career}
                                        onChange={(e) => updateCareer(index, e.target.value)}
                                        placeholder="경력사항을 입력하세요"
                                        className="flex-1 text-sm"
                                      />
                                      <Button
                                        type="button"
                                        onClick={() => removeCareer(index)}
                                        variant="destructive"
                                        size="sm"
                                      >
                                        🗑️
                                      </Button>
                                    </div>
                                  ))}
                                  {formData.careers.length === 0 && (
                                    <p className="text-muted-foreground text-sm">등록된 경력이 없습니다.</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* 보기 모드 */
                          <div>
                            {/* 기본 정보 (항상 보임) */}
                            <div
                              className="flex justify-between items-center cursor-pointer p-2 rounded transition-colors"
                              onClick={() => togglePlayerExpansion(player.id)}
                            >
                              <div className="flex items-center gap-4">
                                <span className="text-lg font-bold text-primary">#{player.backNumber}</span>
                                <h4 className="font-semibold text-lg">
                                  {player.name}
                                  {player.isPrimary && (
                                    <span className="ml-2 text-yellow-500" title="주요 선수">
                                      ⭐
                                    </span>
                                  )}
                                </h4>
                                <span className="text-sm text-muted-foreground">🏫 {player.department}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  {expandedPlayerIds.has(player.id) ? '△' : '▽'}
                                </span>
                              </div>
                            </div>

                            {/* 상세 정보 (토글) */}
                            {expandedPlayerIds.has(player.id) && (
                              <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">📅 생년월일:</span>
                                      <span>{player.birth || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">🏃 포지션:</span>
                                      <span>{player.position}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">📏 신장:</span>
                                      <span>{player.height ? `${player.height}cm` : '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">⚖️ 체중:</span>
                                      <span>{player.weight ? `${player.weight}kg` : '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">⭐ 주요 선수:</span>
                                      <span
                                        className={`font-medium ${player.isPrimary ? 'text-yellow-600' : 'text-gray-400'}`}
                                      >
                                        {player.isPrimary ? '✓' : '✗'}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">❤️ 좋아요:</span>
                                      <span className="font-medium">{player.likeCount}개</span>
                                    </div>
                                    {player.careers.length > 0 && (
                                      <div className="flex items-start gap-2">
                                        <span className="font-medium">🏆 주요 경력:</span>
                                        <div className="flex-1">
                                          {player.careers.map((career, index) => (
                                            <div key={index} className="text-sm mb-1">
                                              • {career}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {player.imageUrl && (
                                    <div className="flex justify-center">
                                      <img
                                        src={player.imageUrl}
                                        alt={player.name}
                                        className="w-32 h-40 object-cover rounded-lg border"
                                      />
                                    </div>
                                  )}
                                </div>

                                {/* 편집/삭제 버튼 */}
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                                  <Button
                                    onClick={() => {
                                      handleEditStart(player);
                                    }}
                                    variant="secondary"
                                    disabled={isCreating || editingPlayerId !== null}
                                  >
                                    ✏️ 수정
                                  </Button>
                                  <Button
                                    onClick={() => {
                                      void handleDeletePlayer(player.id, player.sport, player.university);
                                    }}
                                    variant="destructive"
                                    disabled={isCreating || editingPlayerId !== null}
                                  >
                                    🗑️ 삭제
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </Card>
                    ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

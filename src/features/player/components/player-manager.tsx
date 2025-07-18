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
    height: number;
    weight: number;
    position: string;
    backNumber: number;
    image: File | null;
  }>({
    name: '',
    university: University.KOREA_UNIVERSITY,
    sport: selectedSport,
    department: '',
    birth: '',
    height: 0,
    weight: 0,
    position: '',
    backNumber: 0,
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
      height: 0,
      weight: 0,
      position: '',
      backNumber: 0,
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
      birth: formatDateForInput(player.birth),
      height: player.height,
      weight: player.weight,
      position: player.position,
      backNumber: player.backNumber,
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
      height: 0,
      weight: 0,
      position: '',
      backNumber: 0,
      image: null,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.department.trim() || !formData.position.trim() || !formData.birth.trim()) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (formData.height <= 0 || formData.weight <= 0 || formData.backNumber <= 0) {
      alert('키, 몸무게, 등번호는 0보다 큰 값이어야 합니다.');
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
        birth: formatDateForStorage(formData.birth),
        height: formData.height,
        weight: formData.weight,
        position: formData.position,
        backNumber: formData.backNumber,
        image: formData.image,
      });
    } else if (editingPlayerId) {
      await handleUpdate(editingPlayerId, {
        name: formData.name,
        university: formData.university,
        sport: formData.sport,
        department: formData.department,
        birth: formatDateForStorage(formData.birth),
        height: formData.height,
        weight: formData.weight,
        position: formData.position,
        backNumber: formData.backNumber,
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
          <p className="text-red-500 text-sm">⚠️ 에러가 발생했습니다</p>
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
                <Label htmlFor="birth">생년월일 *</Label>
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
                  type="number"
                  min="1"
                  value={formData.backNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, backNumber: Number(e.target.value) }))}
                  placeholder="등번호"
                />
              </div>
              <div>
                <Label htmlFor="height">키 (cm) *</Label>
                <Input
                  id="height"
                  type="number"
                  min="1"
                  value={formData.height}
                  onChange={(e) => setFormData((prev) => ({ ...prev, height: Number(e.target.value) }))}
                  placeholder="키"
                />
              </div>
              <div>
                <Label htmlFor="weight">몸무게 (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  min="1"
                  value={formData.weight}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weight: Number(e.target.value) }))}
                  placeholder="몸무게"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="image">선수 이미지 *</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
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
                                <Label htmlFor="edit-birth">생년월일 *</Label>
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
                                  type="number"
                                  value={formData.backNumber}
                                  onChange={(e) =>
                                    setFormData((prev) => ({ ...prev, backNumber: Number(e.target.value) }))
                                  }
                                  placeholder="등번호"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-height">키 (cm) *</Label>
                                <Input
                                  id="edit-height"
                                  type="number"
                                  value={formData.height}
                                  onChange={(e) => setFormData((prev) => ({ ...prev, height: Number(e.target.value) }))}
                                  placeholder="키"
                                  className="text-sm"
                                />
                              </div>
                              <div>
                                <Label htmlFor="edit-weight">몸무게 (kg) *</Label>
                                <Input
                                  id="edit-weight"
                                  type="number"
                                  value={formData.weight}
                                  onChange={(e) => setFormData((prev) => ({ ...prev, weight: Number(e.target.value) }))}
                                  placeholder="몸무게"
                                  className="text-sm"
                                />
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
                                <h4 className="font-semibold text-lg">{player.name}</h4>
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
                                      <span>{player.birth}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">🏃 포지션:</span>
                                      <span>{player.position}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">📏 신장:</span>
                                      <span>{player.height}cm</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">⚖️ 체중:</span>
                                      <span>{player.weight}kg</span>
                                    </div>
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

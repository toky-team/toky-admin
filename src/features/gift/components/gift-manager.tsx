import { useState } from 'react';

import { useGift } from '~/features/gift/hooks/use-gift';
import type { Gift } from '~/features/gift/types/gift';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';

export function GiftManager() {
  const { gifts, error, handleCreate, handleUpdate, handleDelete } = useGift();
  const [isCreating, setIsCreating] = useState(false);
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    alias: string;
    requiredTicket: string;
    image: File | null;
  }>({
    name: '',
    alias: '',
    requiredTicket: '',
    image: null,
  });

  const handleCreateStart = () => {
    setIsCreating(true);
    setFormData({
      name: '',
      alias: '',
      requiredTicket: '',
      image: null,
    });
  };

  const handleEditStart = (gift: Gift) => {
    setEditingGiftId(gift.id);
    setFormData({
      name: gift.name,
      alias: gift.alias,
      requiredTicket: gift.requiredTicket.toString(),
      image: null,
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingGiftId(null);
    setFormData({
      name: '',
      alias: '',
      requiredTicket: '',
      image: null,
    });
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.alias.trim() || !formData.requiredTicket.trim()) {
      alert('필수 정보를 모두 입력해주세요.');
      return;
    }

    const requiredTicket = Number(formData.requiredTicket);
    if (requiredTicket <= 0) {
      alert('필요 응모권 수는 0보다 큰 값이어야 합니다.');
      return;
    }

    if (isCreating) {
      if (!formData.image) {
        alert('경품 이미지를 업로드해주세요.');
        return;
      }
      await handleCreate({
        name: formData.name,
        alias: formData.alias,
        requiredTicket,
        image: formData.image,
      });
    } else if (editingGiftId) {
      await handleUpdate(editingGiftId, {
        name: formData.name,
        alias: formData.alias,
        requiredTicket,
        image: formData.image ?? undefined,
      });
    }
    handleCancel();
  };

  const handleDeleteGift = async (giftId: string) => {
    if (confirm('정말로 이 경품을 삭제하시겠습니까?')) {
      await handleDelete(giftId);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 빈 문자열이거나 양수만 허용
    if (value === '' || (/^\d+$/.test(value) && Number(value) > 0)) {
      setFormData((prev) => ({ ...prev, requiredTicket: value }));
    }
  };

  return (
    <div className="space-y-4 mx-auto px-4">
      {/* 에러 메시지 */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-500 text-sm">⚠️ 에러가 발생했습니다: {error.message}</p>
        </Card>
      )}

      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">🎁 경품 목록({gifts.length}개)</h2>
        <Button onClick={handleCreateStart} disabled={isCreating || editingGiftId !== null}>
          ➕ 경품 추가
        </Button>
      </div>

      {/* 경품 추가 폼 */}
      {isCreating && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">새 경품 추가</h3>
              <div className="flex gap-2">
                <Button onClick={() => void handleSave()}>💾 저장</Button>
                <Button onClick={handleCancel} variant="secondary">
                  ❌ 취소
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">경품 이름 *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="경품 이름"
                />
              </div>
              <div>
                <Label htmlFor="alias">별칭 *</Label>
                <Input
                  id="alias"
                  value={formData.alias}
                  onChange={(e) => setFormData((prev) => ({ ...prev, alias: e.target.value }))}
                  placeholder="별칭"
                />
              </div>
              <div>
                <Label htmlFor="requiredTicket">필요 응모권 수 *</Label>
                <Input
                  id="requiredTicket"
                  type="text"
                  inputMode="numeric"
                  value={formData.requiredTicket}
                  onChange={handleNumberChange}
                  placeholder="필요 응모권 수"
                  className="[&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
              <div>
                <Label htmlFor="image">경품 이미지 *</Label>
                <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 경품 목록 */}
      <div>
        {gifts.length === 0 ? (
          <Card className="p-8">
            <p className="text-muted-foreground text-center">등록된 경품이 없습니다.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gifts.map((gift) => (
              <Card key={gift.id} className="p-4">
                {editingGiftId === gift.id ? (
                  /* 편집 모드 */
                  <div className="space-y-3">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold">경품 정보 수정</h4>
                      <div className="flex gap-1">
                        <Button onClick={() => void handleSave()} size="sm">
                          💾
                        </Button>
                        <Button onClick={handleCancel} variant="secondary" size="sm">
                          ❌
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="edit-name">경품 이름 *</Label>
                        <Input
                          id="edit-name"
                          value={formData.name}
                          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                          placeholder="경품 이름"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-alias">별칭 *</Label>
                        <Input
                          id="edit-alias"
                          value={formData.alias}
                          onChange={(e) => setFormData((prev) => ({ ...prev, alias: e.target.value }))}
                          placeholder="별칭"
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-requiredTicket">필요 응모권 수 *</Label>
                        <Input
                          id="edit-requiredTicket"
                          type="text"
                          inputMode="numeric"
                          value={formData.requiredTicket}
                          onChange={handleNumberChange}
                          placeholder="필요 응모권 수"
                          className="text-sm [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-image">경품 이미지</Label>
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
                  <div className="space-y-3">
                    {/* 경품 이미지 */}
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      {gift.imageUrl ? (
                        <img
                          src={gift.imageUrl}
                          alt={gift.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/placeholder-gift.png';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">🎁</div>
                      )}
                    </div>

                    {/* 경품 정보 */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-lg" style={{ whiteSpace: 'pre-line' }}>
                        {gift.name.replace(/\\n/g, '\n')}
                      </h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">🏷️ 별칭:</span>
                          <span>{gift.alias}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">🎫 필요 응모권:</span>
                          <span>{gift.requiredTicket.toLocaleString()}개</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">🎯 응모 횟수:</span>
                          <span className="font-medium">{gift.drawCount.toLocaleString()}회</span>
                        </div>
                      </div>
                    </div>

                    {/* 편집/삭제 버튼 */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => {
                          handleEditStart(gift);
                        }}
                        variant="secondary"
                        size="sm"
                        disabled={isCreating || editingGiftId !== null}
                        className="flex-1"
                      >
                        ✏️ 수정
                      </Button>
                      <Button
                        onClick={() => {
                          void handleDeleteGift(gift.id);
                        }}
                        variant="destructive"
                        size="sm"
                        disabled={isCreating || editingGiftId !== null}
                        className="flex-1"
                      >
                        🗑️ 삭제
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

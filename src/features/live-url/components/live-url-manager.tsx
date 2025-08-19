import { useState } from 'react';

import { useLiveUrl } from '~/features/live-url/hooks/use-live-url';
import type { LiveUrl } from '~/features/live-url/types/live-url';
import { emojiMap, Sport } from '~/shared/types/sport';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';

const sports = Object.values(Sport);

// YouTube URL 유효성 검사
const isYouTubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname === 'youtu.be' || urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com';
  } catch {
    return false;
  }
};

// YouTube URL에서 비디오 ID 추출
const getYouTubeVideoId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    let videoId = '';

    if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      videoId = urlObj.searchParams.get('v') || '';

      // embed URL인 경우 경로에서 비디오 ID 추출
      if (!videoId && urlObj.pathname.includes('/embed/')) {
        const pathParts = urlObj.pathname.split('/');
        const embedIndex = pathParts.indexOf('embed');
        if (embedIndex !== -1 && pathParts[embedIndex + 1]) {
          videoId = pathParts[embedIndex + 1];
        }
      }
    }

    return videoId || null;
  } catch {
    return null;
  }
};

// 유튜브 URL을 embed URL로 변환
const getYouTubeEmbedUrl = (url: string): string | null => {
  const videoId = getYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
};

// 이미 embed URL인지 확인
const isEmbedUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname.includes('/embed/');
  } catch {
    return false;
  }
};

interface LiveUrlFormData {
  broadcastName: string;
  url: string;
}

export function LiveUrlManager() {
  const [selectedSport, setSelectedSport] = useState<Sport>(Sport.FOOTBALL);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<LiveUrlFormData>({
    broadcastName: '',
    url: '',
  });

  const { liveUrls, error, handleCreate, handleUpdate, handleDelete } = useLiveUrl();

  const selectedLiveUrls = liveUrls[selectedSport] || [];

  const resetForm = () => {
    setFormData({
      broadcastName: '',
      url: '',
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.broadcastName.trim() || !formData.url.trim()) {
      alert('방송명과 URL을 모두 입력해주세요.');
      return;
    }

    // YouTube URL 유효성 검사
    if (!isYouTubeUrl(formData.url)) {
      alert('YouTube URL만 입력 가능합니다.\n예: https://www.youtube.com/watch?v=... 또는 https://youtu.be/...');
      return;
    }

    let finalUrl = formData.url;

    // embed URL이 아닌 경우 변환 확인
    if (!isEmbedUrl(formData.url)) {
      const embedUrl = getYouTubeEmbedUrl(formData.url);
      if (embedUrl) {
        const shouldConvert = confirm(
          '일반 YouTube URL이 입력되었습니다.\n' +
            'embed 형태로 변환하여 저장하시겠습니까?\n\n' +
            `원본: ${formData.url}\n` +
            `변환될 URL: ${embedUrl}`
        );

        if (shouldConvert) {
          finalUrl = embedUrl;
          // 폼 데이터도 업데이트
          setFormData((prev) => ({ ...prev, url: embedUrl }));
        }
      }
    }

    try {
      if (editingId) {
        await handleUpdate(editingId, selectedSport, formData.broadcastName, finalUrl);
      } else {
        await handleCreate(selectedSport, formData.broadcastName, finalUrl);
      }
      resetForm();
    } catch {
      alert('저장에 실패했습니다.');
    }
  };

  const handleEdit = (liveUrl: LiveUrl) => {
    setFormData({
      broadcastName: liveUrl.broadcastName,
      url: liveUrl.url,
    });
    setEditingId(liveUrl.id);
    setIsCreating(true);
  };

  const handleDeleteConfirm = async (id: string) => {
    if (confirm('정말로 삭제하시겠습니까?')) {
      try {
        await handleDelete(id, selectedSport);
      } catch {
        alert('삭제에 실패했습니다.');
      }
    }
  };

  return (
    <div className="space-y-4 mx-auto px-4">
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="text-red-500">⚠️</div>
            <div>
              <p className="text-red-600 font-medium">오류 발생</p>
              <p className="text-red-600 text-sm">{error.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* 종목 탭 */}
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

      {/* 새 URL 추가 버튼 */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {emojiMap[selectedSport]} {selectedSport} Live URL 관리
        </h2>
        <Button onClick={() => setIsCreating(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          + 새 URL 추가
        </Button>
      </div>

      {/* 폼 모달 */}
      {isCreating && (
        <Card className="p-6 border-2 border-indigo-200 bg-indigo-50">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingId ? 'Live URL 수정' : '새 Live URL 추가'}</h3>
              <Button variant="outline" onClick={resetForm}>
                취소
              </Button>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <Label htmlFor="broadcastName">방송사명</Label>
                <Input
                  id="broadcastName"
                  value={formData.broadcastName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, broadcastName: e.target.value }))}
                  placeholder="예: KUBS, SBN"
                  required
                />
              </div>

              <div>
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=... 또는 https://youtu.be/..."
                  required
                  className={formData.url && !isYouTubeUrl(formData.url) ? 'border-red-500 focus:border-red-500' : ''}
                />

                {/* URL 유효성 피드백 */}
                {formData.url && (
                  <div className="mt-2 text-sm">
                    {isYouTubeUrl(formData.url) ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <span>✅</span>
                        <span>유효한 YouTube URL입니다</span>
                        {!isEmbedUrl(formData.url) && (
                          <span className="text-blue-600 ml-2">📝 저장 시 embed 형태로 변환됩니다</span>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <span>❌</span>
                        <span>YouTube URL만 입력 가능합니다</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* URL 미리보기 */}
              {formData.url && getYouTubeEmbedUrl(formData.url) && (
                <div className="space-y-2">
                  <Label>미리보기</Label>
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <iframe
                      src={getYouTubeEmbedUrl(formData.url)!}
                      width="100%"
                      height="200"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="rounded"
                    />
                  </div>
                </div>
              )}

              {formData.url && !getYouTubeEmbedUrl(formData.url) && (
                <div className="text-yellow-600 text-sm">
                  ⚠️ 유효한 YouTube URL이 아닙니다. 미리보기를 사용할 수 없습니다.
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {editingId ? '수정' : '추가'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  취소
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Live URL 목록 */}
      <div className="space-y-4">
        {selectedLiveUrls.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <p className="text-lg font-medium">등록된 Live URL이 없습니다</p>
              <p className="text-sm mt-1">새 URL을 추가해보세요</p>
            </div>
          </Card>
        ) : (
          selectedLiveUrls.map((liveUrl) => (
            <Card key={liveUrl.id} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">{liveUrl.broadcastName}</h3>
                    <p className="text-sm text-gray-600 break-all">{liveUrl.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(liveUrl)}>
                      수정
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => void handleDeleteConfirm(liveUrl.id)}>
                      삭제
                    </Button>
                  </div>
                </div>

                {/* YouTube 미리보기 */}
                {getYouTubeEmbedUrl(liveUrl.url) && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="aspect-video">
                      <iframe
                        src={getYouTubeEmbedUrl(liveUrl.url)!}
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="rounded"
                      />
                    </div>
                  </div>
                )}

                {!getYouTubeEmbedUrl(liveUrl.url) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-yellow-700 text-sm">
                      🔗 일반 링크:{' '}
                      <a
                        href={liveUrl.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:no-underline"
                      >
                        {liveUrl.url}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

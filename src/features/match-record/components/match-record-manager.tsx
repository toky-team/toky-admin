import { Download, Upload } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useMatchRecord } from '~/features/match-record/hooks/use-match-record';
import type { MatchRecord } from '~/features/match-record/types/match-record';
import { ExcelUploader } from '~/shared/components/excel-uploader';
import { createExcelTemplate, createExcelTemplateWithData, type ExcelRow } from '~/shared/lib/excel-utils';
import { emojiMap, Sport } from '~/shared/types/sport';
import { University } from '~/shared/types/university';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';
import { Input } from '~/shared/ui/input';
import { Label } from '~/shared/ui/label';

export function MatchRecordManager() {
  // 기본 상태
  const [selectedSport, setSelectedSport] = useState<Sport>(Sport.FOOTBALL);
  const [isCreating, setIsCreating] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [imageUploadingLeague, setImageUploadingLeague] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // 폼 데이터 상태
  const [editingFormData, setEditingFormData] = useState<{
    league: string;
    winningComment: string;
    leagueFullName: string;
    universityStatKeys: string[];
    universityStats: Array<{
      university: University;
      stats: Record<string, string>;
    }>;
    playerStatsWithCategory: Array<{
      category: string;
      playerStatKeys: string[];
      playerStats: Array<{
        playerId: string | null;
        name: string;
        university: University;
        position: string | null;
        stats: Record<string, string>;
      }>;
    }>;
  }>({
    league: '',
    winningComment: '',
    leagueFullName: '',
    universityStatKeys: [],
    universityStats: [
      { university: University.KOREA_UNIVERSITY, stats: {} },
      { university: University.YONSEI_UNIVERSITY, stats: {} },
    ],
    playerStatsWithCategory: [],
  });

  // API 훅
  const { records, error, handleUpdate, handleSetLeagueImage } = useMatchRecord();

  // 폼 초기화
  const resetForm = () => {
    setEditingFormData({
      league: '',
      winningComment: '',
      leagueFullName: '',
      universityStatKeys: [],
      universityStats: [
        { university: University.KOREA_UNIVERSITY, stats: {} },
        { university: University.YONSEI_UNIVERSITY, stats: {} },
      ],
      playerStatsWithCategory: [],
    });
  };

  // 스포츠 변경 시 상태 초기화
  useEffect(() => {
    setIsCreating(false);
    setEditingRecordId(null);
    setImageUploadingLeague(null);
    setUploadError(null);
    setUploadSuccess(null);
    resetForm();
  }, [selectedSport]);

  // 스포츠 목록
  const sports = Object.values(Sport);

  // 카테고리별 선수 통계용 엑셀 템플릿 다운로드
  const handleDownloadCategoryPlayerStatsTemplate = (categoryIndex: number) => {
    const category = editingFormData.playerStatsWithCategory[categoryIndex];
    const existingStatKeys = category.playerStatKeys || [];
    const existingPlayerStats = category.playerStats || [];

    const headers = [
      '이름',
      '대학교',
      '포지션',
      ...existingStatKeys, // 해당 카테고리의 기존 통계 항목들
    ];

    const categoryName = category.category || `카테고리${categoryIndex + 1}`;

    // 기존 데이터가 있으면 데이터 포함 템플릿, 없으면 빈 템플릿 생성
    if (existingPlayerStats.length > 0) {
      // 기존 데이터를 엑셀 행 형태로 변환
      const excelData = existingPlayerStats.map((player) => {
        const row: Record<string, unknown> = {
          이름: player.name,
          대학교: player.university,
          포지션: player.position || '',
        };

        // 통계 데이터 추가
        existingStatKeys.forEach((statKey) => {
          row[statKey] = player.stats[statKey] || '';
        });

        return row;
      });

      createExcelTemplateWithData(headers, excelData, `${selectedSport}_${categoryName}_선수통계_데이터포함.xlsx`);
    } else {
      // 빈 템플릿 생성
      createExcelTemplate(headers, `${selectedSport}_${categoryName}_선수통계_템플릿.xlsx`);
    }
  };

  const handleRecordUploadError = (error: string) => {
    setUploadError(error);
    setUploadSuccess(null);
  };

  // 카테고리별 선수 통계 엑셀 데이터 처리
  const handleCategoryPlayerStatsExcelUpload = (data: ExcelRow[], categoryIndex: number) => {
    setUploadError(null);
    setUploadSuccess(null);

    if (data.length === 0) {
      setUploadError('엑셀 파일에 데이터가 없습니다.');
      return;
    }

    try {
      // 첫 번째 행에서 헤더 정보 추출
      const firstRow = data[0];
      const headers = Object.keys(firstRow);

      // 기본 컬럼들 확인
      const requiredColumns = ['이름', '대학교'];
      const missingColumns = requiredColumns.filter((col) => !headers.includes(col));

      if (missingColumns.length > 0) {
        setUploadError(`필수 컬럼이 누락되었습니다: ${missingColumns.join(', ')}`);
        return;
      }

      // 통계 항목 추출 (이름, 대학교, 포지션 제외)
      const playerStatKeys = headers.filter((header) => !['이름', '대학교', '포지션'].includes(header));

      // 선수 데이터 변환
      const playerStats = data.map((row) => {
        const stats: Record<string, string> = {};
        playerStatKeys.forEach((key) => {
          const value = row[key];
          if (typeof value === 'string' || typeof value === 'number') {
            stats[key] = String(value);
          } else {
            stats[key] = '0';
          }
        });

        return {
          playerId: null,
          name: typeof row['이름'] === 'string' ? row['이름'] : '',
          university: (typeof row['대학교'] === 'string' ? row['대학교'] : '') as University,
          position: typeof row['포지션'] === 'string' ? row['포지션'] : null,
          stats,
        };
      });

      // 현재 편집 중인 폼의 특정 카테고리에 반영
      setEditingFormData((prev) => {
        const newPlayerStatsWithCategory = [...prev.playerStatsWithCategory];

        if (newPlayerStatsWithCategory[categoryIndex]) {
          newPlayerStatsWithCategory[categoryIndex] = {
            ...newPlayerStatsWithCategory[categoryIndex],
            playerStatKeys,
            playerStats,
          };
        }

        return {
          ...prev,
          playerStatsWithCategory: newPlayerStatsWithCategory,
        };
      });

      const categoryName =
        editingFormData.playerStatsWithCategory[categoryIndex]?.category || `카테고리 #${categoryIndex + 1}`;
      setUploadSuccess(
        `${categoryName}에 ${data.length}명의 선수 통계 데이터가 성공적으로 로드되었습니다. (통계 항목: ${playerStatKeys.join(', ')})`
      );
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '데이터 처리 중 오류가 발생했습니다.');
    }
  };
  const selectedRecords = useMemo(() => records[selectedSport] || [], [records, selectedSport]);

  // 대학 통계 키 관리
  const handleAddUniversityStatKey = () => {
    const statKey = prompt('추가할 통계 항목명을 입력하세요:');
    if (statKey && !editingFormData.universityStatKeys.includes(statKey)) {
      setEditingFormData((prev) => ({
        ...prev,
        universityStatKeys: [...prev.universityStatKeys, statKey],
      }));
    }
  };

  const handleRemoveUniversityStatKey = (statKey: string) => {
    setEditingFormData((prev) => ({
      ...prev,
      universityStatKeys: prev.universityStatKeys.filter((key) => key !== statKey),
      universityStats: prev.universityStats.map((stat) => ({
        ...stat,
        stats: Object.fromEntries(Object.entries(stat.stats).filter(([key]) => key !== statKey)),
      })),
    }));
  };

  const handleUniversityStatChange = (university: University, statKey: string, value: string) => {
    setEditingFormData((prev) => ({
      ...prev,
      universityStats: prev.universityStats.map((stat) =>
        stat.university === university ? { ...stat, stats: { ...stat.stats, [statKey]: value } } : stat
      ),
    }));
  };

  // 선수 카테고리 관리
  const handleAddPlayerCategory = () => {
    const category = prompt('카테고리명을 입력하세요:');
    if (category) {
      setEditingFormData((prev) => ({
        ...prev,
        playerStatsWithCategory: [...prev.playerStatsWithCategory, { category, playerStatKeys: [], playerStats: [] }],
      }));
    }
  };

  const handleRemovePlayerCategory = (categoryIndex: number) => {
    setEditingFormData((prev) => ({
      ...prev,
      playerStatsWithCategory: prev.playerStatsWithCategory.filter((_, i) => i !== categoryIndex),
    }));
  };

  // 선수 통계 키 관리
  const handleAddPlayerStatKey = (categoryIndex: number) => {
    const statKey = prompt('추가할 통계 항목명을 입력하세요:');
    if (statKey) {
      setEditingFormData((prev) => ({
        ...prev,
        playerStatsWithCategory: prev.playerStatsWithCategory.map((cat, i) =>
          i === categoryIndex
            ? {
                ...cat,
                playerStatKeys: cat.playerStatKeys.includes(statKey)
                  ? cat.playerStatKeys
                  : [...cat.playerStatKeys, statKey],
              }
            : cat
        ),
      }));
    }
  };

  const handleRemovePlayerStatKey = (categoryIndex: number, statKey: string) => {
    setEditingFormData((prev) => ({
      ...prev,
      playerStatsWithCategory: prev.playerStatsWithCategory.map((cat, i) =>
        i === categoryIndex
          ? {
              ...cat,
              playerStatKeys: cat.playerStatKeys.filter((key) => key !== statKey),
              playerStats: cat.playerStats.map((player) => ({
                ...player,
                stats: Object.fromEntries(Object.entries(player.stats).filter(([key]) => key !== statKey)),
              })),
            }
          : cat
      ),
    }));
  };

  // 선수 관리
  const handleAddPlayer = (categoryIndex: number) => {
    setEditingFormData((prev) => ({
      ...prev,
      playerStatsWithCategory: prev.playerStatsWithCategory.map((cat, i) =>
        i === categoryIndex
          ? {
              ...cat,
              playerStats: [
                ...cat.playerStats,
                {
                  playerId: null,
                  name: '',
                  university: University.KOREA_UNIVERSITY,
                  position: null,
                  stats: {},
                },
              ],
            }
          : cat
      ),
    }));
  };

  const handleRemovePlayer = (categoryIndex: number, playerIndex: number) => {
    setEditingFormData((prev) => ({
      ...prev,
      playerStatsWithCategory: prev.playerStatsWithCategory.map((cat, i) =>
        i === categoryIndex
          ? {
              ...cat,
              playerStats: cat.playerStats.filter((_, pi) => pi !== playerIndex),
            }
          : cat
      ),
    }));
  };

  const handlePlayerChange = (categoryIndex: number, playerIndex: number, field: string, value: string) => {
    setEditingFormData((prev) => ({
      ...prev,
      playerStatsWithCategory: prev.playerStatsWithCategory.map((cat, i) =>
        i === categoryIndex
          ? {
              ...cat,
              playerStats: cat.playerStats.map((player, pi) => {
                if (pi !== playerIndex) return player;

                if (field.startsWith('stats.')) {
                  const statKey = field.replace('stats.', '');
                  return {
                    ...player,
                    stats: { ...player.stats, [statKey]: value },
                  };
                }

                return { ...player, [field]: value };
              }),
            }
          : cat
      ),
    }));
  };

  // CRUD 핸들러
  const handleCreateStart = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleEditStart = (record: MatchRecord) => {
    setEditingFormData({
      league: record.league,
      winningComment: record.winningComment,
      leagueFullName: record.leagueFullName,
      universityStatKeys: record.universityStatKeys,
      universityStats: record.universityStats,
      playerStatsWithCategory: record.playerStatsWithCategory,
    });
    setEditingRecordId(`${record.sport}-${record.league}`);
  };

  const handleEditSave = async () => {
    try {
      const recordData: Omit<MatchRecord, 'sport'> = {
        league: editingFormData.league,
        winningComment: editingFormData.winningComment,
        leagueFullName: editingFormData.leagueFullName,
        imageUrl: null, // 이미지는 별도로 관리
        universityStatKeys: editingFormData.universityStatKeys,
        universityStats: editingFormData.universityStats,
        playerStatsWithCategory: editingFormData.playerStatsWithCategory,
      };

      if (isCreating) {
        const existingRecords = records[selectedSport] || [];
        await handleUpdate(selectedSport, [...existingRecords, { sport: selectedSport, ...recordData }]);
        setIsCreating(false);
      } else if (editingRecordId) {
        const existingRecords = records[selectedSport] || [];
        const updatedRecords = existingRecords.map((record) =>
          `${record.sport}-${record.league}` === editingRecordId ? { ...record, ...recordData } : record
        );
        await handleUpdate(selectedSport, updatedRecords);
        setEditingRecordId(null);
      }

      resetForm();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('저장 실패:', error);
    }
  };

  const handleEditCancel = () => {
    setIsCreating(false);
    setEditingRecordId(null);
    resetForm();
  };

  const handleDeleteRecord = async (record: MatchRecord) => {
    if (confirm(`${record.sport} - ${record.league} 기록을 삭제하시겠습니까?`)) {
      try {
        const existingRecords = records[record.sport] || [];
        const updatedRecords = existingRecords.filter(
          (r) => `${r.sport}-${r.league}` !== `${record.sport}-${record.league}`
        );
        await handleUpdate(record.sport, updatedRecords);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('삭제 실패:', error);
      }
    }
  };

  // 이미지 관련 핸들러
  const handleImageUpload = async (sport: Sport, league: string, file: File) => {
    setImageUploadingLeague(league);
    try {
      await handleSetLeagueImage(sport, league, file);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('이미지 업로드 실패:', error);
    } finally {
      setImageUploadingLeague(null);
    }
  };

  const handleImageDelete = async (sport: Sport, league: string) => {
    if (confirm(`${league} 리그의 이미지를 삭제하시겠습니까?`)) {
      setImageUploadingLeague(league);
      try {
        await handleSetLeagueImage(sport, league, null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('이미지 삭제 실패:', error);
      } finally {
        setImageUploadingLeague(null);
      }
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
          {emojiMap[selectedSport]} {selectedSport} 경기 기록 관리
        </h2>
        <Button onClick={handleCreateStart} disabled={isCreating || editingRecordId !== null}>
          ➕ 기록 추가
        </Button>
      </div>

      {/* 업로드 결과 메시지 - 생성/편집 중일 때만 표시 */}
      {(isCreating || editingRecordId) && uploadError && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-500 text-sm">⚠️ {uploadError}</p>
        </Card>
      )}

      {(isCreating || editingRecordId) && uploadSuccess && (
        <Card className="p-4 border-green-200 bg-green-50">
          <p className="text-green-600 text-sm">✅ {uploadSuccess}</p>
        </Card>
      )}

      {/* 에러 메시지 */}
      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-500 text-sm">⚠️ 에러가 발생했습니다: {error.message}</p>
        </Card>
      )}

      {/* 기록 추가/편집 폼 */}
      {(isCreating || editingRecordId) && (
        <Card className="p-6">
          <div className="space-y-6">
            {/* 헤더 */}
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">{isCreating ? '새 경기 기록 추가' : '경기 기록 편집'}</h3>
              <div className="flex gap-2">
                <Button onClick={() => void handleEditSave()}>💾 저장</Button>
                <Button onClick={handleEditCancel} variant="secondary">
                  ❌ 취소
                </Button>
              </div>
            </div>

            {/* 리그 정보 */}
            <div>
              <Label htmlFor="league">리그명</Label>
              {isCreating ? (
                <Input
                  id="league"
                  value={editingFormData.league}
                  onChange={(e) => setEditingFormData((prev) => ({ ...prev, league: e.target.value }))}
                  placeholder="리그명을 입력하세요"
                />
              ) : (
                <div>
                  <Input
                    id="league"
                    value={editingFormData.league}
                    readOnly
                    className="bg-gray-800 text-gray-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    리그명은 생성 후 변경할 수 없습니다. 다른 리그명이 필요하면 새로 생성해주세요.
                  </p>
                </div>
              )}
            </div>

            {/* 승부 코멘트 */}
            <div>
              <Label htmlFor="winningComment">승부 코멘트</Label>
              <Input
                id="winningComment"
                value={editingFormData.winningComment}
                onChange={(e) => setEditingFormData((prev) => ({ ...prev, winningComment: e.target.value }))}
                placeholder="승부 코멘트를 입력하세요"
              />
            </div>

            {/* 리그 전체명 */}
            <div>
              <Label htmlFor="leagueFullName">리그 전체명</Label>
              <Input
                id="leagueFullName"
                value={editingFormData.leagueFullName}
                onChange={(e) => setEditingFormData((prev) => ({ ...prev, leagueFullName: e.target.value }))}
                placeholder="리그 전체명을 입력하세요"
              />
            </div>

            {/* 대학 통계 편집 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">대학 통계</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddUniversityStatKey}>
                  ➕ 통계 항목 추가
                </Button>
              </div>

              {/* 대학 통계 키 관리 */}
              {editingFormData.universityStatKeys.length > 0 && (
                <div className="mb-4">
                  <Label>통계 항목</Label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {editingFormData.universityStatKeys.map((statKey) => (
                      <span
                        key={statKey}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm"
                      >
                        {statKey}
                        <button
                          type="button"
                          onClick={() => handleRemoveUniversityStatKey(statKey)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 대학별 통계 테이블 */}
              {editingFormData.universityStatKeys.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-500">
                        <th className="border border-gray-300 px-2 py-1 text-left">대학</th>
                        {editingFormData.universityStatKeys.map((statKey) => (
                          <th key={statKey} className="border border-gray-300 px-2 py-1 text-left">
                            {statKey}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {editingFormData.universityStats.map((stat) => (
                        <tr key={stat.university}>
                          <td className="border border-gray-300 px-2 py-1 font-medium">{stat.university}</td>
                          {editingFormData.universityStatKeys.map((statKey) => (
                            <td key={statKey} className="border border-gray-300 px-2 py-1">
                              <Input
                                value={stat.stats[statKey] || ''}
                                onChange={(e) => handleUniversityStatChange(stat.university, statKey, e.target.value)}
                                className="text-sm"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 선수 통계 편집 */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold">선수 통계</h4>
                <Button type="button" variant="outline" size="sm" onClick={handleAddPlayerCategory}>
                  ➕ 카테고리 추가
                </Button>
              </div>

              {/* 카테고리별 선수 통계 */}
              <div className="space-y-6">
                {editingFormData.playerStatsWithCategory.map((category, categoryIndex) => (
                  <Card key={categoryIndex} className="p-4 border-blue-200">
                    <div className="space-y-4">
                      {/* 카테고리 헤더 */}
                      <div className="flex justify-between items-start">
                        <h5 className="font-medium text-blue-700">
                          📊 {category.category || `카테고리 #${categoryIndex + 1}`}
                        </h5>
                        <div className="flex flex-col gap-2">
                          {/* 엑셀 관련 버튼들 */}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadCategoryPlayerStatsTemplate(categoryIndex)}
                            >
                              <Download className="w-3 h-3 mr-1" />
                              템플릿 다운로드
                            </Button>
                            <ExcelUploader
                              onDataParsed={(data) => handleCategoryPlayerStatsExcelUpload(data, categoryIndex)}
                              onError={handleRecordUploadError}
                            >
                              <Button type="button" variant="outline" size="sm">
                                <Upload className="w-3 h-3 mr-1" />
                                엑셀 업로드
                              </Button>
                            </ExcelUploader>
                          </div>
                          {/* 데이터 관리 버튼들 */}
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddPlayerStatKey(categoryIndex)}
                            >
                              📈 통계 항목 추가
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddPlayer(categoryIndex)}
                            >
                              👤 선수 추가
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemovePlayerCategory(categoryIndex)}
                            >
                              🗑️ 카테고리 삭제
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* 카테고리명 수정 */}
                      <div>
                        <Label>카테고리명</Label>
                        <Input
                          value={category.category}
                          onChange={(e) =>
                            setEditingFormData((prev) => ({
                              ...prev,
                              playerStatsWithCategory: prev.playerStatsWithCategory.map((cat, i) =>
                                i === categoryIndex ? { ...cat, category: e.target.value } : cat
                              ),
                            }))
                          }
                          placeholder="예: 득점, 어시스트 등"
                        />
                      </div>

                      {/* 통계 키 관리 */}
                      {category.playerStatKeys.length > 0 && (
                        <div>
                          <Label>통계 항목</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {category.playerStatKeys.map((statKey) => (
                              <span
                                key={statKey}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                              >
                                {statKey}
                                <button
                                  type="button"
                                  onClick={() => handleRemovePlayerStatKey(categoryIndex, statKey)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 선수 통계 테이블 */}
                      {category.playerStats.length > 0 && (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-500">
                                <th className="border border-gray-300 px-2 py-1 text-left">이름</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">대학</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">포지션</th>
                                {category.playerStatKeys.map((statKey) => (
                                  <th key={statKey} className="border border-gray-300 px-2 py-1 text-left">
                                    {statKey}
                                  </th>
                                ))}
                                <th className="border border-gray-300 px-2 py-1 text-left">삭제</th>
                              </tr>
                            </thead>
                            <tbody>
                              {category.playerStats.map((player, playerIndex) => (
                                <tr key={playerIndex}>
                                  <td className="border border-gray-300 px-2 py-1">
                                    <Input
                                      value={player.name}
                                      onChange={(e) =>
                                        handlePlayerChange(categoryIndex, playerIndex, 'name', e.target.value)
                                      }
                                      placeholder="선수명"
                                      className="text-sm"
                                    />
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1">
                                    <select
                                      value={player.university}
                                      onChange={(e) =>
                                        handlePlayerChange(categoryIndex, playerIndex, 'university', e.target.value)
                                      }
                                      className="w-full px-2 py-1 border border-input rounded text-sm"
                                    >
                                      <option value={University.KOREA_UNIVERSITY}>고려대학교</option>
                                      <option value={University.YONSEI_UNIVERSITY}>연세대학교</option>
                                    </select>
                                  </td>
                                  <td className="border border-gray-300 px-2 py-1">
                                    <Input
                                      value={player.position || ''}
                                      onChange={(e) =>
                                        handlePlayerChange(categoryIndex, playerIndex, 'position', e.target.value)
                                      }
                                      placeholder="포지션"
                                      className="text-sm"
                                    />
                                  </td>
                                  {category.playerStatKeys.map((statKey) => (
                                    <td key={statKey} className="border border-gray-300 px-2 py-1">
                                      <Input
                                        value={player.stats[statKey] || ''}
                                        onChange={(e) =>
                                          handlePlayerChange(
                                            categoryIndex,
                                            playerIndex,
                                            `stats.${statKey}`,
                                            e.target.value
                                          )
                                        }
                                        className="text-sm"
                                      />
                                    </td>
                                  ))}
                                  <td className="border border-gray-300 px-2 py-1">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      onClick={() => handleRemovePlayer(categoryIndex, playerIndex)}
                                    >
                                      🗑️
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {category.playerStats.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          선수가 없습니다. 위 버튼으로 선수를 추가해주세요.
                        </p>
                      )}
                    </div>
                  </Card>
                ))}

                {editingFormData.playerStatsWithCategory.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    카테고리가 없습니다. 위 버튼으로 카테고리를 추가해주세요.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 경기 기록 목록 */}
      {!selectedRecords || selectedRecords.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">경기 기록이 없습니다.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {selectedRecords.map((record) => (
            <Card key={`${record.sport}-${record.league}`} className="p-6">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{record.sport}</h3>
                    <p className="text-sm text-muted-foreground">리그 - {record.league}</p>
                    {record.leagueFullName && (
                      <p className="text-sm text-muted-foreground mb-1">리그 전체명 - {record.leagueFullName}</p>
                    )}
                    {record.winningComment && (
                      <p className="text-sm text-muted-foreground" style={{ whiteSpace: 'pre-line' }}>
                        승부 코멘트
                        <br />
                        <span className="inline-block mt-1 px-3 py-2 bg-black rounded-md border text-center text-white">
                          {record.winningComment.replace(/\\n/g, '\n')}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditStart(record)}
                      variant="secondary"
                      disabled={editingRecordId !== null || isCreating}
                    >
                      ✏️ 수정
                    </Button>
                    <Button
                      onClick={() => void handleDeleteRecord(record)}
                      variant="destructive"
                      disabled={editingRecordId !== null || isCreating}
                    >
                      🗑️ 삭제
                    </Button>
                  </div>
                </div>

                {/* 리그 이미지 관리 */}
                <div className="mb-6 p-4 bg-gray-500 rounded-lg">
                  <div className="flex items-start gap-6">
                    {record.imageUrl ? (
                      <img
                        src={record.imageUrl}
                        alt={`${record.league} 다이어그램`}
                        className="w-32 h-32 object-contain rounded border bg-white shadow-sm"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded border flex items-center justify-center shadow-sm">
                        <span className="text-gray-400 text-sm">이미지 없음</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <h4 className="font-semibold mb-3">리그 이미지</h4>
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              void handleImageUpload(record.sport, record.league, file);
                            }
                          }}
                          className="hidden"
                          id={`image-upload-${record.sport}-${record.league}`}
                          disabled={imageUploadingLeague === record.league}
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={imageUploadingLeague === record.league}
                          onClick={() => {
                            const input = document.getElementById(
                              `image-upload-${record.sport}-${record.league}`
                            ) as HTMLInputElement;
                            input?.click();
                          }}
                        >
                          {imageUploadingLeague === record.league
                            ? '업로드 중...'
                            : record.imageUrl
                              ? '🔄 이미지 변경'
                              : '📷 이미지 추가'}
                        </Button>
                        {record.imageUrl && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => void handleImageDelete(record.sport, record.league)}
                            disabled={imageUploadingLeague === record.league}
                          >
                            {imageUploadingLeague === record.league ? '삭제 중...' : '🗑️ 삭제'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 대학 통계 표시 */}
                {record.universityStatKeys && record.universityStatKeys.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">대학 통계</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-500">
                            <th className="border border-gray-300 px-2 py-1 text-left">대학</th>
                            {record.universityStatKeys.map((statKey) => (
                              <th key={statKey} className="border border-gray-300 px-2 py-1 text-left">
                                {statKey}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(record.universityStats || []).map((stat) => (
                            <tr key={stat.university}>
                              <td className="border border-gray-300 px-2 py-1 font-medium">{stat.university}</td>
                              {record.universityStatKeys.map((statKey) => (
                                <td key={statKey} className="border border-gray-300 px-2 py-1">
                                  {stat.stats[statKey] || '-'}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 선수 통계 표시 - 카테고리별 */}
                <div className="space-y-4">
                  {(record.playerStatsWithCategory || []).map((category, index) => (
                    <div key={index}>
                      <h4 className="font-semibold mb-2">선수 통계 - {category.category}</h4>
                      {category.playerStats &&
                      category.playerStats.length > 0 &&
                      category.playerStatKeys &&
                      category.playerStatKeys.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse border border-gray-300">
                            <thead>
                              <tr className="bg-gray-500">
                                <th className="border border-gray-300 px-2 py-1 text-left">이름</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">대학</th>
                                <th className="border border-gray-300 px-2 py-1 text-left">포지션</th>
                                {category.playerStatKeys.map((statKey) => (
                                  <th key={statKey} className="border border-gray-300 px-2 py-1 text-left">
                                    {statKey}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {category.playerStats.map((player, playerIndex) => (
                                <tr key={playerIndex}>
                                  <td className="border border-gray-300 px-2 py-1 font-medium">{player.name}</td>
                                  <td className="border border-gray-300 px-2 py-1">{player.university}</td>
                                  <td className="border border-gray-300 px-2 py-1">{player.position || '-'}</td>
                                  {category.playerStatKeys.map((statKey) => (
                                    <td key={statKey} className="border border-gray-300 px-2 py-1">
                                      {player.stats[statKey] || '-'}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">데이터가 없습니다.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

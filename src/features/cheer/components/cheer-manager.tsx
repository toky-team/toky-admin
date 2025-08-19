import { useCheer } from '~/features/cheer/hooks/use-cheer';
import { useCheerWebSocket } from '~/features/cheer/hooks/use-cheer-websocket';
import { emojiMap, Sport } from '~/shared/types/sport';
import { University } from '~/shared/types/university';
import { Button } from '~/shared/ui/button';
import { Card } from '~/shared/ui/card';

const sports = Object.values(Sport);

const sportNames: Record<Sport, string> = {
  [Sport.FOOTBALL]: '축구',
  [Sport.BASKETBALL]: '농구',
  [Sport.BASEBALL]: '야구',
  [Sport.RUGBY]: '럭비',
  [Sport.ICE_HOCKEY]: '아이스하키',
};

export function CheerManager() {
  const { cheers: apiCheers, error: apiError, handleReset } = useCheer();
  const { cheers: wsCheers, isConnected, error: wsError, addCheer } = useCheerWebSocket();

  // WebSocket 데이터가 있으면 우선 사용, 없으면 API 데이터 사용
  const getCheersData = (sport: Sport) => {
    return wsCheers[sport] || apiCheers[sport];
  };

  const handleAddCheer = (sport: Sport, university: University) => {
    if (!isConnected) {
      return;
    }
    addCheer(sport, university, 1);
  };

  const handleResetCheer = async (sport: Sport) => {
    await handleReset(sport);
  };

  const error = wsError || apiError;

  return (
    <div className="space-y-6">
      {/* 연결 상태 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-600">
            {isConnected ? '웹소켓 실시간 연결됨' : '웹소켓 연결 끊어짐 (API 데이터 사용 중)'}
          </span>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="text-red-500">⚠️</div>
            <div>
              <p className="text-red-600 font-medium">오류 발생</p>
              <p className="text-red-600 text-sm">{error instanceof Error ? error.message : error}</p>
              {wsError && (
                <p className="text-red-500 text-xs mt-1">웹소켓 오류: connect_error 또는 error 이벤트에서 발생</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 응원 데이터 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sports.map((sport) => {
          const cheerData = getCheersData(sport);
          const kuLikes = cheerData?.KULike || 0;
          const yuLikes = cheerData?.YULike || 0;
          const total = kuLikes + yuLikes;

          return (
            <Card key={sport} className="p-6">
              <div className="space-y-4">
                {/* 종목 헤더 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{emojiMap[sport]}</span>
                    <h3 className="text-lg font-semibold">{sportNames[sport]}</h3>
                  </div>
                  <div className="text-sm text-gray-500">총 {total.toLocaleString()}개</div>
                </div>

                {/* 응원 현황 */}
                <div className="space-y-3">
                  {/* 고려대학교 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-red-600">고려대학교</span>
                      <span className="font-bold text-red-600">{kuLikes.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: total > 0 ? `${(kuLikes / total) * 100}%` : '50%',
                        }}
                      />
                    </div>
                  </div>

                  {/* 연세대학교 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-blue-600">연세대학교</span>
                      <span className="font-bold text-blue-600">{yuLikes.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: total > 0 ? `${(yuLikes / total) * 100}%` : '50%',
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* 응원 버튼들 */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddCheer(sport, University.KOREA_UNIVERSITY)}
                      className={`flex-1 text-white transition-all duration-200 ${
                        isConnected
                          ? 'bg-red-500 hover:bg-red-600 shadow-md hover:shadow-lg'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                      disabled={!isConnected}
                    >
                      {isConnected ? '고려대 응원 +1' : '고려대 응원 (연결중...)'}
                    </Button>
                    <Button
                      onClick={() => handleAddCheer(sport, University.YONSEI_UNIVERSITY)}
                      className={`flex-1 text-white transition-all duration-200 ${
                        isConnected
                          ? 'bg-blue-500 hover:bg-blue-600 shadow-md hover:shadow-lg'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                      disabled={!isConnected}
                    >
                      {isConnected ? '연세대 응원 +1' : '연세대 응원 (연결중...)'}
                    </Button>
                  </div>

                  <Button
                    onClick={() => {
                      void handleResetCheer(sport);
                    }}
                    variant="outline"
                    className="w-full text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  >
                    응원 초기화
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

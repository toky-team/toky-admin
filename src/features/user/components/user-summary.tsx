import { useUserSummary } from '~/features/user/hooks/use-user-summary';
import { Card } from '~/shared/ui/card';

export function UserSummary() {
  const { data, error } = useUserSummary();

  if (!data && !error) {
    return <Card className="text-sm text-muted text-center">⏳ 유저 데이터 확인 중...</Card>;
  }

  if (error || !data) {
    return <Card className="text-sm text-danger text-center">❌ 서버 상태 오류</Card>;
  }

  return (
    <Card className="text-sm space-y-6">
      {/* 현재 유저 수 */}
      <div>
        <p className="text-base font-semibold mb-2">👤 현재 유저 수</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-muted">총 유저</p>
            <p className="font-bold text-lg">{data.totalUsers.toLocaleString()}명</p>
          </div>
          <div>
            <p className="text-muted">고려대</p>
            <p className="font-bold text-lg">{data.KUUsers.toLocaleString()}명</p>
          </div>
          <div>
            <p className="text-muted">연세대</p>
            <p className="font-bold text-lg">{data.YUUsers.toLocaleString()}명</p>
          </div>
        </div>
      </div>

      {/* 신규 가입자 */}
      <div>
        <p className="text-base font-semibold mb-2">📈 신규 가입자 수</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-muted">오늘</p>
            <p className="font-bold text-lg">{data.newUsers.today.toLocaleString()}명</p>
          </div>
          <div>
            <p className="text-muted">이번 주</p>
            <p className="font-bold text-lg">{data.newUsers.thisWeek.toLocaleString()}명</p>
          </div>
          <div>
            <p className="text-muted">이번 달</p>
            <p className="font-bold text-lg">{data.newUsers.thisMonth.toLocaleString()}명</p>
          </div>
        </div>
      </div>
    </Card>
  );
}

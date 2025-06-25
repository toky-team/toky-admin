import { HealthSummary } from '~/features/health/components/health-summary';
import PageContainer from '~/shared/components/page-container';
import { Card } from '~/shared/ui/card';
import { PageTitle } from '~/shared/ui/page-title';

export default function HomePage() {
  return (
    <PageContainer>
      <PageTitle>DashBoard</PageTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <HealthSummary />
        {/* 여기에 추가 컴포넌트들 배치 */}
        <Card>
          <p className="text-sm font-semibold">📅 일정 요약</p>
          <p className="text-muted">데이터 없음</p>
        </Card>
        <Card>
          <p className="text-sm font-semibold">📈 기타 요약</p>
          <p className="text-muted">데이터 없음</p>
        </Card>
      </div>
    </PageContainer>
  );
}

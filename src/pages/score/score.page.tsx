import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function ScorePage() {
  return (
    <PageContainer>
      <div className="text-center space-y-4">
        <PageTitle>점수 페이지</PageTitle>
        <p>이 페이지는 점수 관련 정보를 표시하는 곳입니다. 현재는 구현되지 않았습니다.</p>
      </div>
    </PageContainer>
  );
}

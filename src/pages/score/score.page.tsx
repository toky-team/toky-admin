import { ScoreManager } from '~/features/score/components/score-manager';
import PageContainer from '~/shared/components/page-container';
import { PageTitle } from '~/shared/ui/page-title';

export default function ScorePage() {
  return (
    <PageContainer>
      <PageTitle>Score Management</PageTitle>
      <ScoreManager />
    </PageContainer>
  );
}
